<?php

namespace AGestOfRobinHood\Core;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Helpers\Log;
use AGestOfRobinHood\Helpers\QueryBuilder;
use AGestOfRobinHood\Helpers\UserException;

/*
 * Engine: a class that allows to handle complex flow
 */

class Engine
{
  public static $tree = null;

  public static function boot()
  {
    $t = Globals::getEngine();
    self::$tree = self::buildTree($t);
    self::ensureSeqRootNode();
  }

  /**
   * Save current tree into Globals table
   */

  public static function save()
  {
    $t = self::$tree->toArray();
    Globals::setEngine($t);
  }

  /**
   * Ensure the root is a SEQ node to be able to insert easily in the current flow
   */
  protected static function ensureSeqRootNode()
  {
    if (!self::$tree instanceof \AGestOfRobinHood\Core\Engine\SeqNode) {
      self::$tree = new \AGestOfRobinHood\Core\Engine\SeqNode([], [self::$tree]);
      self::save();
    }
  }

  /**
   * Setup the engine, given an array representing a tree
   * @param array $t
   */
  public static function setup($t, $callback)
  {
    self::$tree = self::buildTree($t);
    self::save();
    Globals::setCallbackEngineResolved($callback);
    Globals::setEngineChoices(0);
    Log::enable(); // Enable log
    Log::startEngine();
  }

  /**
   * Convert an array into a tree
   * @param array $t
   */
  public static function buildTree($t)
  {
    $t['children'] = $t['children'] ?? [];
    $type = $t['type'] ?? (empty($t['children']) ? NODE_LEAF : NODE_SEQ);

    $children = [];
    foreach ($t['children'] as $child) {
      $children[] = self::buildTree($child);
    }

    $className = '\AGestOfRobinHood\Core\Engine\\' . ucfirst($type) . 'Node';
    unset($t['children']);
    return new $className($t, $children);
  }

  /**
   * Recursively compute the next unresolved node we are going to address
   */
  public static function getNextUnresolved()
  {
    return self::$tree->getNextUnresolved();
  }

  /**
   * Proceed to next unresolved part of tree
   * // TODO: check $isUndo flag 
   */
  public static function proceed($confirmedPartial = false, $isUndo = false)
  {
    $node = self::$tree->getNextUnresolved();
    // If there are no nodes to resolve we are done. Either transition to
    // confirm state of auto confirm if no choices were made by the player
    if ($node == null) {
      if (Globals::getEngineChoices() == 0) {
        self::confirm(); // No choices were made => auto confirm
      } else {
        // Confirm/restart
        Game::get()->gamestate->jumpToState(ST_CONFIRM_TURN);
      }
      return;
    }

    $oldPlayerId = Game::get()->getActivePlayerId();
    $playerId = $node->getPlayerId();

    // Multi active node
    if ($playerId == 'all') {
      Game::get()->gamestate->jumpToState(ST_RESOLVE_STACK);
      Game::get()->gamestate->setAllPlayersMultiactive();

      // Ensure no undo
      Log::checkpoint();
      Globals::setEngineChoices(0);

      // Proceed to do the action
      self::proceedToState($node, $isUndo);
      return;
    }

    // Confirm partial turn in case next unresolved node in tree
    // activates a different player and player has made choices
    if (
      $playerId != null &&
      $oldPlayerId != $playerId &&
      Globals::getEngineChoices() != 0 &&
      !$confirmedPartial
    ) {
      Game::get()->gamestate->jumpToState(ST_CONFIRM_PARTIAL_TURN);
      return;
    }

    $player = Players::get($playerId);
    // Jump to resolveStack state to ensure we can change active playerId
    if ($playerId != null && $oldPlayerId != $playerId) {
      Game::get()->gamestate->jumpToState(ST_RESOLVE_STACK);
      Game::get()->gamestate->changeActivePlayer($playerId);
    }

    if ($confirmedPartial) {
      Log::enable();
      Log::checkpoint();
      Globals::setEngineChoices(0);
    }

    self::proceedToState($node, $isUndo);
  }

  public static function proceedToState($node, $isUndo = false)
  {
    $state = $node->getState();
    // $args = $node->getArgs();
    $actionId = AtomicActions::getActionOfState($state, false);
    // Do some pre-action code if needed and if we are not undoing to an irreversible node
    // TODO: check if we need isIrreversible check at some point?
    // if (!$isUndo || !$node->isIrreversible(Players::get($node->getPId()))) {
    if (!$isUndo) {
      AtomicActions::stPreAction($actionId, $node);
    }
    Game::get()->gamestate->jumpToState($state);
  }

  /**
   * Resolve the current unresolved node
   * @param array $args : store informations about the resolution (choices made by players)
   */
  public static function resolve($args = [])
  {
    // Get current node
    $node = self::$tree->getNextUnresolved();
    // Resolve node
    $node->resolve($args);
    self::save();
  }

  /**
   * Resolve action : resolve the action of a leaf action node
   */
  public static function resolveAction($args = [], $checkpoint = false, &$node = null)
  {
    if (is_null($node)) {
      $node = self::$tree->getNextUnresolved();
    }

    $node->resolveAction($args);
    if ($node->isResolvingParent()) {
      $node->getParent()->resolve([]);
    }


    self::save();

    if (!isset($args['automatic']) || $args['automatic'] === false) {
      Globals::incEngineChoices();
    }
    if ($checkpoint) {
      self::checkpoint();
    }
  }

  /**
   * Checkpoint for undo func functionality
   */
  public static function checkpoint()
  {
    Globals::setEngineChoices(0);
    Log::checkpoint();
  }

  /**
   * Insert a new node at root level of the tree at the end of seq node
   */
  public static function insertAtRoot($t, $last = true)
  {
    self::ensureSeqRootNode();
    $node = self::buildTree($t);
    if ($last) {
      self::$tree->pushChild($node);
    } else {
      self::$tree->unshiftChild($node);
    }
    self::save();
    return $node;
  }


  /**
   * insertAsChild: turn the node into a SEQ if needed, then insert the flow tree as a child
   */
  public static function insertAsChild($t, &$node = null)
  {
    if (is_null($t)) {
      return;
    }
    if (is_null($node)) {
      $node = self::$tree->getNextUnresolved();
    }

    // If the node is an action leaf, turn it into a SEQ node first
    if ($node->getType() == NODE_LEAF) {
      $newNode = $node->toArray();
      $newNode['type'] = NODE_SEQ;
      $node = $node->replace(self::buildTree($newNode));
    }

    // Push child
    $node->pushChild(self::buildTree($t));
    self::save();
  }

  /**
   * Confirm the full resolution of current flow
   */
  public static function confirm()
  {
    $node = self::$tree->getNextUnresolved();
    // Are we done ?
    if ($node != null) {
      throw new \feException("You can't confirm an ongoing turn");
    }

    // Callback
    $callback = Globals::getCallbackEngineResolved();
    if (isset($callback['state'])) {
      Game::get()->gamestate->jumpToState($callback['state']);
    } elseif (isset($callback['order'])) {
      Game::get()->nextPlayerCustomOrder($callback['order']);
    } elseif (isset($callback['method'])) {
      $name = $callback['method'];
      Game::get()->$name();
    }
  }

  public static function confirmPartialTurn()
  {
    $node = self::$tree->getNextUnresolved();

    // Are we done ?
    if ($node == null) {
      throw new \feException("You can't partial confirm an ended turn");
    }

    $oldPlayerId = Game::get()->getActivePlayerId();
    $playerId = $node->getPlayerId();

    if ($oldPlayerId == $playerId) {
      throw new \feException("You can't partial confirm for the same player");
    }

    // Clear log
    self::checkpoint();
    Engine::proceed(true);
  }

  /**
   * Restart the whole flow
   */
  public static function restart()
  {
    Log::undoTurn();

    // Force to clear cached informations
    Globals::fetch();
    self::boot();
    self::proceed(false, true);
  }

  /**
   * Restart at a given step
   */
  public static function undoToStep($stepId)
  {
    Log::undoToStep($stepId);

    // Force to clear cached informations
    Globals::fetch();
    self::boot();
    self::proceed(false, true);
  }

  /**
   * Clear all nodes related to the current active zombie player
   */
  public static function clearZombieNodes($playerId)
  {
    self::$tree->clearZombieNodes($playerId);
  }

  /**
   * Get all resolved actions of given types
   */
  public static function getResolvedActions($types)
  {
    return self::$tree->getResolvedActions($types);
  }

  /**
   * Get all unresolved actions of given types
   */
  public static function getUnresolvedActions($types)
  {
    return self::$tree->getUnresolvedActions($types);
  }

  public static function getLastResolvedAction($types)
  {
    $actions = self::getResolvedActions($types);
    return empty($actions) ? null : $actions[count($actions) - 1];
  }
}
