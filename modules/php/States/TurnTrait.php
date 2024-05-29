<?php

namespace AGestOfRobinHood\States;

use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\Log;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\AtomicActions;


trait TurnTrait
{
  /**
   * State function when starting a turn useful to intercept
   * for some cards that happens at that moment
   */
  function stBeforeStartOfTurn()
  {
    // TODO: check end callback
    $this->initCustomDefaultTurnOrder('default', \ST_TURNACTION, ST_BEFORE_START_OF_TURN, true);
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
          'action' => PLAYER_ACTION,
          'playerId' => $player->getId(),
        ],
      ],
    ];

    // Inserting leaf Action card
    Engine::setup($node, ['method' => 'stTurnAction']);
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

  function stPreEndOfGame()
  {
  }

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
