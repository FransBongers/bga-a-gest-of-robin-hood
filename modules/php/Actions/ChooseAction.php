<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;


class ChooseAction extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_CHOOSE_ACTION;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsChooseAction()
  {
    $data = [
      SINGLE_PLOT => Markers::getTopOf(Locations::initiativeTrack(SINGLE_PLOT)) === null,
      EVENT => Markers::getTopOf(Locations::initiativeTrack(EVENT)) === null,
      PLOTS_AND_DEEDS => Markers::getTopOf(Locations::initiativeTrack(PLOTS_AND_DEEDS)) === null,
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

  public function actPassChooseAction()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  // public function actPlayerAction($cardId, $strength)
  public function actChooseAction($args)
  {
    self::checkAction('actChooseAction');
    $action = $args['action'];
    $pass = $args['pass'];

    $stateArgs = $this->argsChooseAction();

    if (!$stateArgs[$action]) {
      throw new \feException("ERROR 003");
    }
    $player = self::getPlayer();
    $marker = $player->getEligibilityMarker();
    $marker->setLocation(Locations::initiativeTrack($action));

    Notifications::chooseAction($player, $marker, $action, $pass);

    if ($pass) {
      $this->handlePass($player, $action);
    } else {
      $this->handleAction($player, $action);
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

  private function handlePass($player, $action)
  {
    $shillings = 1;

    if ($player->isSheriff()) {
      if ($action === EVENT) {
        $shillings = 2;
      } else if ($action === PLOTS_AND_DEEDS) {
        $shillings = 3;
      }
    }

    $player->incShillings($shillings);
  }

  private function handleAction($player, $action)
  {
    $parent = $this->ctx->getParent();

    switch ($action) {
      case SINGLE_PLOT:
      case PLOTS_AND_DEEDS:
        $parent->pushChild(new LeafNode([
          'action' => SELECT_PLOT,
          'playerId' => $this->ctx->getPlayerId(),
        ]));
        break;
      case EVENT:
        break;
    }
  }
}
