<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Spaces\Nottingham;

class SelectPlot extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_SELECT_PLOT;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsSelectPlot()
  {
    // $action = $this->getSelectedAction();

    // $numberOfSpaces = $action === PLOTS_AND_DEEDS ? 3 : 1;

    $player = self::getPlayer();

    $info = $this->ctx->getInfo();
    $cost = isset($info['cost']) ? $info['cost'] : null;


    $data = [
      'options' => $this->getOptions($player, $cost),
      'extraOptionId' => $this->getExtraOptionId(),
      // $player->isRobinHood() ?
      //   $this->getRobinHoodOptions($player, $numberOfSpaces) :
      //   $this->getSheriffOptions($player, $numberOfSpaces),
    ];

    return $data;
  }

  //  .########..##..........###....##....##.########.########.
  //  .##.....##.##.........##.##....##..##..##.......##.....##
  //  .##.....##.##........##...##....####...##.......##.....##
  //  .########..##.......##.....##....##....######...########.
  //  .##........##.......#########....##....##.......##...##..
  //  .##........##.......##.....##....##....##.......##....##.
  //  .##........########.##.....##....##....########.##.....##

  // ....###.....######..########.####..#######..##....##
  // ...##.##...##....##....##.....##..##.....##.###...##
  // ..##...##..##..........##.....##..##.....##.####..##
  // .##.....##.##..........##.....##..##.....##.##.##.##
  // .#########.##..........##.....##..##.....##.##..####
  // .##.....##.##....##....##.....##..##.....##.##...###
  // .##.....##..######.....##....####..#######..##....##

  public function actPassSelectPlot()
  {
    $parent = $this->ctx->getParent();
    if ($this->getSelectedAction() === PLOTS_AND_DEEDS) {
      $parent->pushChild(new LeafNode([
        'action' => SELECT_DEED,
        'playerId' => $this->ctx->getPlayerId(),
      ]));
    }

    // Notifications::passAction($player, $shillings);
    // Stats::incPassActionCount($player->getId(), 1);
    // Engine::resolve(PASS);
    $this->resolveAction([
      'pass' => true,
    ]);
  }

  public function actSelectPlot($args)
  {
    self::checkAction('actSelectPlot');
    $plotId = isset($args['plotId']) ? $args['plotId'] : null;
    $extraOptionId = isset($args['extraOptionId']) ? $args['extraOptionId'] : null;

    // Notifications::log('actSelectPlot', $args);
    // $spaceIds = $args['spaceIds'];

    $stateArgs = $this->argsSelectPlot();

    $options = $stateArgs['options'];

    if ($plotId === null && $extraOptionId === null) {
      throw new \feException("ERROR 045");
    }

    if ($plotId !== null && !isset($options[$plotId])) {
      throw new \feException("ERROR 006");
    }

    if ($extraOptionId !== null && $extraOptionId !== $stateArgs['extraOptionId']) {
      throw new \feException("ERROR 046");
    }

    if ($plotId !== null) {
      Notifications::selectedPlot(self::getPlayer(), $options[$plotId]);
      $parent = $this->ctx->getParent();

      $info = $this->ctx->getInfo();
      $cost = isset($info['cost']) ? $info['cost'] : null;

      $node = [
        'action' => $plotId,
        'playerId' => $this->ctx->getPlayerId(),
        // 'optional' => true,
      ];
      if ($cost !== null) {
        $node['cost'] = $cost;
      }

      $this->ctx->insertAsBrother(new LeafNode($node));

      $playerId = $this->ctx->getPlayerId();
      if ($this->getSelectedAction() === PLOTS_AND_DEEDS) {
        $parent->pushChild(new LeafNode([
          'action' => SELECT_DEED,
          'playerId' => $playerId,
          'optional' => true,
        ]));
      }
      switch ($plotId) {
        case RECRUIT:
          Stats::incRecruit($playerId, 1);
          break;
        case SNEAK:
          Stats::incSneak($playerId, 1);
          break;
        case ROB:
          Stats::incRob($playerId, 1);
          break;
        case HIRE:
          Stats::incHire($playerId, 1);
          break;
        case PATROL:
          Stats::incPatrol($playerId, 1);
          break;
        case CAPTURE:
          Stats::incCapture($playerId, 1);
          break;
        default:
          break;
      }
    } else if ($extraOptionId !== null) {
      // used for heavy raind event where player has the option to gain shillings
      $this->resolveExtraOption($extraOptionId);
    }




    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private function resolveExtraOption($extraOptionId)
  {
    $player = self::getPlayer();

    switch ($extraOptionId) {
      case GAIN_TWO_SHILLINGS:
        Notifications::extraOption($player, $extraOptionId);
        $player->incShillings(2);
        break;
    }
  }

  private function getExtraOptionId()
  {
    $info = $this->ctx->getInfo();

    if (isset($info['source'])) {
      $source = $info['source'];
      switch ($source) {
        case 'Event16_HeavyRain':
          return GAIN_TWO_SHILLINGS;
          defaukt:
          return null;
      }
    } else {
      return null;
    }
  }

  public function getOptions($player, $cost = null)
  {
    $side = $player->getSide();
    $plots = $side === ROBIN_HOOD ? [RECRUIT, SNEAK, ROB] : [HIRE, PATROL, CAPTURE];

    $options = [];
    $availableShillings = $player->getShillings();

    foreach ($plots as $plot) {
      $action = AtomicActions::get($plot);
      $canBePerformed = $action->canBePerformed($player, $availableShillings, $cost);
      if (!$canBePerformed) {
        continue;
      }
      $options[$plot] = $action->getName();
    }

    return $options;
  }
}
