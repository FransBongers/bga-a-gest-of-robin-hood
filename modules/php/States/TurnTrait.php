<?php

namespace AGestOfRobinHood\States;

use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Log;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Spaces\Nottingham;

trait TurnTrait
{
  /**
   * State function when starting a turn useful to intercept
   * for some cards that happens at that moment
   */
  function stBeforeStartOfTurn()
  {
    // TODO: check end callback
    // TODO: can probably be disabled?


    // $player = Players::getActive();

    $node = [
      'children' => [
        [
          'action' => SETUP_ROBIN_HOOD,
          'playerId' => Players::getRobinHoodPlayerId(),
        ],
      ],
    ];

    Engine::setup($node, ['method' => 'stStartOfRound']);
    Engine::proceed();
  }

  function stStartOfRound()
  {
    Notifications::startOfRound(Cards::getBalladAndEvent(true));
    $card = Cards::drawAndRevealCard();

    $node = [
      'children' => []
    ];

    $carriageMoves = $card->getCarriageMoves();
    $numberOfCarriagesOnMap = GameMap::getNumberOfCarriages();

    $numberOfMoves = min($carriageMoves, $numberOfCarriagesOnMap);
    for ($i = 0; $i < $numberOfMoves; $i++) {
      $node['children'][] = [
        'action' => MOVE_CARRIAGE,
        'playerId' => Players::getSheriffPlayerId(),
        'remainingMoves' => $numberOfMoves - $i,
      ];
    }

    $resolveEvent = $card->isFortuneEvent() || $card->isRoyalInspection();

    // Sheriff must move carriages
    // Fortune event resolve
    // Resolve Royal inspection

    if (count($node['children']) > 0) {
      Engine::setup($node, $resolveEvent ? ['method' => 'stResolveEvent'] :  ['method' => 'stInitTurnOrder']);
      Engine::proceed();
    } else if ($resolveEvent) {
      $this->stResolveEvent();
    } else {
      $this->stInitTurnOrder();
    }
  }

  function stResolveEvent()
  {
    $card = Cards::getTopOf(EVENTS_DISCARD);

    // Reset engine here because some event cards check resolved nodes
    // to determine if an action can be done.
    Engine::setup([
      'children' => []
    ], ['method' => 'stResolveEvent']);

    $node = $card->getFlow();

    if (count($node['children']) > 0) {
      Engine::setup($node, ['method' => 'stStartOfRound']);
      Engine::proceed();
    } else {
      // TODO: add notification that it's not possible to resolve any action
      $this->stStartOfRound();
    }
  }


  function stInitTurnOrder()
  {
    $this->initCustomTurnOrder('default', Players::getEligibilityOrder(), \ST_TURNACTION, ST_END_OF_ROUND, false);
  }

  function stEndOfRound()
  {
    $markers = Markers::get([ROBIN_HOOD_ELIGIBILITY_MARKER, SHERIFF_ELIGIBILITY_MARKER])->toArray();

    $locationValues = [
      Locations::initiativeTrack(FIRST_ELIGIBLE) => -1, // Only here because a cylinder can stay on the track in zombie mode
      Locations::initiativeTrack(SINGLE_PLOT) => 0,
      Locations::initiativeTrack(EVENT) => 1,
      Locations::initiativeTrack(PLOTS_AND_DEEDS) => 2,
      Locations::initiativeTrack(SECOND_ELIGIBLE) => 3, // Only here because a cylinder can stay on the track in zombie mode
    ];

    usort($markers, function ($a, $b) use ($locationValues) {
      return $locationValues[$a->getLocation()] - $locationValues[$b->getLocation()];
    });

    foreach ($markers as $index => $marker) {
      if ($index === 0) {
        $marker->setLocation(Locations::initiativeTrack(FIRST_ELIGIBLE));
      } else {
        $marker->setLocation(Locations::initiativeTrack(SECOND_ELIGIBLE));
      }
    }

    Notifications::firstEligible($markers[0]);
    Notifications::secondEligible($markers[1]);

    $this->gamestate->jumpToState(ST_START_OF_ROUND);
    // $this->initCustomDefaultTurnOrder('default', \ST_TURNACTION, ST_END_OF_ROUND, false);
  }

  /**
   * Activate next player
   */
  function stTurnAction()
  {
    $player = Players::getActive();
    self::giveExtraTime($player->getId());

    $node = [
      'children' => [
        [
          'action' => CHOOSE_ACTION,
          'playerId' => $player->getId(),
        ],
      ],
    ];

    // Inserting leaf Action card
    Engine::setup($node, ['method' => 'stEndOfTurn']);
    Engine::proceed();
  }

  /*******************************
   ********************************
   ********** END OF TURN *********
   ********************************
   *******************************/

  /**
   * End of turn
   */
  function stEndOfTurn()
  {

    $player = Players::getActive();

    $this->nextPlayerCustomOrder('default');
  }

  function endOfGameInit()
  {
    // if (Globals::getEndFinalScoringDone() !== true) {
    //   // Trigger discard state
    //   Engine::setup(
    //     [
    //       'action' => DISCARD_SCORING,
    //       'playerId' => 'all',
    //       'args' => ['current' => Players::getActive()->getId()],
    //     ],
    //     ''
    //   );
    //   Engine::proceed();
    // } else {
    //   // Goto scoring state
    //   $this->gamestate->jumpToState(\ST_PRE_END_OF_GAME);
    // }
    // return;
  }

  function stPreEndOfGame() {}

  /*
  function stLaunchEndOfGame()
  {
    foreach (ZooCards::getAllCardsWithMethod('EndOfGame') as $card) {
      $card->onEndOfGame();
    }
    Globals::setTurn(15);
    Globals::setLiveScoring(true);
    Scores::update(true);
    Notifications::seed(Globals::getGameSeed());
    $this->gamestate->jumpToState(\ST_END_GAME);
  }
  */
}
