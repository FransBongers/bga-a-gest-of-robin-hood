<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class RoyalInspectionUnrest extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_ROYAL_INSPECTION_UNREST;
  }

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  // ....###.....######..########.####..#######..##....##
  // ...##.##...##....##....##.....##..##.....##.###...##
  // ..##...##..##..........##.....##..##.....##.####..##
  // .##.....##.##..........##.....##..##.....##.##.##.##
  // .#########.##..........##.....##..##.....##.##..####
  // .##.....##.##....##....##.....##..##.....##.##...###
  // .##.....##..######.....##....####..#######..##....##

  public function stRoyalInspectionUnrest()
  {

    $player = self::getPlayer();
    $riMarker = Markers::get(ROYAL_INSPECTION_MARKER);
    $riMarker->setLocation(Locations::royalInspectionTrack(UNREST));
    Notifications::royalInspectionUnrestPhase($riMarker);
    $numberOfSubmissiveParishes = count(Utils::filter(Spaces::get(PARISHES)->toArray(), function ($space) {
      return $space->isSubmissive();
    }));
    if ($numberOfSubmissiveParishes >= 5) {
      Players::moveRoyalFavour($player, 1, ORDER, true);
    } else if ($numberOfSubmissiveParishes >= 3) {
      Players::moveRoyalFavour($player, 1, JUSTICE, true);
    } else if ($numberOfSubmissiveParishes >= 1) {
      Players::moveRoyalFavour($player, 2, JUSTICE, true);
    } else if ($numberOfSubmissiveParishes === 0) {
      Players::moveRoyalFavour($player, 3, JUSTICE, true);
    }

    $rfMarker = Markers::get(ROYAL_FAVOUR_MARKER);
    $currentLocation = $rfMarker->getLocation();
    $splitLocation = explode('_', $currentLocation);
    $currentValue = intval($splitLocation[1]);

    if ($this->ctx->getInfo()['isKingRichardsReturn'] || $currentValue >= 5) {
      Game::get()->gamestate->jumpToState(ST_PRE_END_GAME);
      return;
    }

    $this->resolveAction(['automatic' => true]);
  }


  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsRoyalInspectionUnrest()
  {
    $data = [];

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

  public function actPassRoyalInspectionUnrest()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actRoyalInspectionUnrest($args)
  {
    self::checkAction('actRoyalInspectionUnrest');


    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...


}
