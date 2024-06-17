<?php

namespace AGestOfRobinHood\Managers;

use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Notifications;

class AtomicActions
{
  // Mapping of actionId and corresponding class
  static $classes = [
    PLAYER_ACTION => 'PlayerAction',
    CAPTURE => 'Capture',
    CHOOSE_ACTION => 'ChooseAction',
    CONFISCATE => 'Confiscate',
    DISPERSE => 'Disperse',
    EVENT_A_TALE_OF_TWO_LOVERS_LIGHT => 'EventATaleOfTwoLoversLight',
    EVENT_AMBUSH_LIGHT => 'EventAmbushLight',
    EVENT_BOATS_BRIDGES_DARK => 'EventBoatsBridgesDark',
    EVENT_BOATS_BRIDGES_LIGHT => 'EventBoatsBridgesLight',
    EVENT_GUY_OF_GISBORNE => 'EventGuyOfGisborne',
    EVENT_SELECT_FORCES => 'EventSelectForces',
    EVENT_SELECT_SPACE => 'EventSelectSpace',
    FORTUNE_EVENT_DAY_OF_MARKET_ROBIN_HOOD => 'FortuneEventDayOfMarketRobinHood',
    FORTUNE_EVENT_DAY_OF_MARKET_SHERIFF => 'FortuneEventDayOfMarketSheriff',
    FORTUNE_EVENT_QUEEN_ELEANOR => 'FortuneEventQueenEleanor',
    DONATE => 'Donate',
    HIRE => 'Hire',
    INSPIRE => 'Inspire',
    MOVE_CARRIAGE => 'MoveCarriage',
    PATROL => 'Patrol',
    PRE_END_GAME => 'PreEndGame',
    RECRUIT => 'Recruit',
    RIDE => 'Ride',
    REMOVE_CAMP => 'RemoveCamp',
    REMOVE_TRAVELLER => 'RemoveTraveller',
    ROB => 'Rob',
    ROYAL_INSPECTION_GOVERNANCE => 'RoyalInspectionGovernance',
    ROYAL_INSPECTION_HIDE_ALL_MERRY_MEN => 'RoyalInspectionHideAllMerryMen',
    ROYAL_INSPECTION_UNREST => 'RoyalInspectionUnrest',
    ROYAL_INSPECTION_MISCHIEF => 'RoyalInspectionMischief',
    ROYAL_INSPECTION_PLACE_ROBIN_HOOD => 'RoyalInspectionPlaceRobinHood',
    ROYAL_INSPECTION_REDEPLOYMENT_SHERIFF => 'RoyalInspectionRedeploymentSheriff',
    ROYAL_INSPECTION_REDEPLOYMENT_ROBIN_HOOD => 'RoyalInspectionRedeploymentRobinHood',
    ROYAL_INSPECTION_RESET => 'RoyalInspectionReset',
    ROYAL_INSPECTION_RETURN_MERRY_MEN_FROM_PRISON => 'RoyalInspectionReturnMerryMenFromPrison',
    ROYAL_INSPECTION_SWAP_ROBIN_HOOD => 'RoyalInspectionSwapRobinHood',
    PLACE_HENCHMEN => 'PlaceHenchmen',
    PLACE_MERRY_MAN_IN_SPACE => 'PlaceMerryManInSpace',
    PUT_CARD_IN_VICTIMS_PILE => 'PutCardInVictimsPile',
    SELECT_DEED => 'SelectDeed',
    SELECT_EVENT_EFFECT => 'SelectEventEffect',
    SELECT_PLOT => 'SelectPlot',
    SELECT_TRAVELLER_CARD_OPTION => 'SelectTravellerCardOption',
    SETUP_ROBIN_HOOD => 'SetupRobinHood',
    SNEAK => 'Sneak',
    SWASHBUCKLE => 'Swashbuckle',
    TURNCOAT => 'Turncoat',
  ];

  public static function get($actionId, $ctx = null)
  {
    if (!\array_key_exists($actionId, self::$classes)) {
      // throw new \feException(print_r(debug_print_backtrace()));
      // throw new \feException(print_r(Globals::getEngine()));
      throw new \BgaVisibleSystemException('Trying to get an atomic action not defined in Actions.php : ' . $actionId);
    }
    $name = '\AGestOfRobinHood\Actions\\' . self::$classes[$actionId];
    return new $name($ctx);
  }

  public static function getActionOfState($stateId, $throwErrorIfNone = true)
  {
    foreach (array_keys(self::$classes) as $actionId) {
      if (self::getState($actionId, null) == $stateId) {
        return $actionId;
      }
    }

    if ($throwErrorIfNone) {
      throw new \BgaVisibleSystemException('Trying to fetch args of a non-declared atomic action in state ' . $stateId);
    } else {
      return null;
    }
  }

  public static function isDoable($actionId, $ctx, $player)
  {
    $res = self::get($actionId, $ctx)->isDoable($player);
    return $res;
  }

  public static function getErrorMessage($actionId)
  {
    $actionId = ucfirst(mb_strtolower($actionId));
    $msg = sprintf(
      Game::get()::translate(
        'Attempting to take an action (%s) that is not possible. Either another card erroneously flagged this action as possible, or this action was possible until another card interfered.'
      ),
      $actionId
    );
    return $msg;
  }

  public static function getState($actionId, $ctx)
  {
    return self::get($actionId, $ctx)->getState();
  }

  public static function getArgs($actionId, $ctx)
  {
    $action = self::get($actionId, $ctx);
    $methodName = 'args' . $action->getClassName();
    $args = \method_exists($action, $methodName) ? $action->$methodName() : [];
    return array_merge($args, ['optionalAction' => $ctx->isOptional()]);
  }

  public static function takeAction($actionId, $actionName, $args, $ctx)
  {
    $player = Players::getActive();
    if (!self::isDoable($actionId, $ctx, $player)) {
      throw new \BgaUserException(self::getErrorMessage($actionId));
    }

    $action = self::get($actionId, $ctx);
    $methodName = $actionName; //'act' . self::$classes[$actionId];
    $action->$methodName($args);
  }

  /**
   * Execute state action
   */
  public static function stAction($actionId, $ctx)
  {
    $action = self::get($actionId, $ctx);
    $methodName = 'st' . $action->getClassName();
    if (\method_exists($action, $methodName)) {
      $action->$methodName();
    }
  }

  /**
   * Action executed before activating the state
   */
  public static function stPreAction($actionId, $ctx)
  {
    $action = self::get($actionId, $ctx);
    $methodName = 'stPre' . $action->getClassName();
    if (\method_exists($action, $methodName)) {
      $action->$methodName();
      // TODO: check if we need irreversible check at some points
      // if ($ctx->isIrreversible(Players::get($ctx->getPId()))) {
      //   Engine::checkpoint();
      // }
    }
  }

  /**
   * Executes pass action as defined in atomic action
   */
  public static function pass($actionId, $ctx)
  {
    if (!$ctx->isOptional()) {
      self::error($ctx->toArray());
      throw new \BgaVisibleSystemException('This action is not optional');
    }

    $action = self::get($actionId, $ctx);
    $methodName = 'actPass' . $action->getClassName();
    if (\method_exists($action, $methodName)) {
      $action->$methodName();
    } else {
      Engine::resolve(PASS);
    }

    Engine::proceed();
  }
}
