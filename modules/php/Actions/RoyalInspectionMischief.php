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
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class RoyalInspectionMischief extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_ROYAL_INSPECTION_MISCHIEF;
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

  public function stRoyalInspectionMischief()
  {
    $riMarker = Markers::get(ROYAL_INSPECTION_MARKER);
    $riMarker->setLocation(Locations::royalInspectionTrack(MISCHIEF));
    Notifications::moveRoyalInspectionMarker($riMarker);

    $countingSpaces = [SHIRE_WOOD, SOUTHWELL_FOREST, OLLERTON_HILL];
    $campsInForest = count(Utils::filter(Forces::getAll()->toArray(), function ($force) use ($countingSpaces) {
      return $force->isCamp() && in_array($force->getLocation(), $countingSpaces);
    }));

    $robinHoodPlayer = Players::getRobinHoodPlayer();
    $robinHoodPlayer->incShillings($campsInForest);

    $this->ctx->insertAsBrother(Engine::buildTree([
      'children' => [
        [
          'action' => SELECT_PLOT,
          'playerId' => $robinHoodPlayer->getId(),
          'optional' => true, 
        ],
        [
          'action' => DONATE,
          'playerId' => $robinHoodPlayer->getId(),
          'optional' => true, 
        ],
        [
          'action' => ROYAL_INSPECTION_RETURN_MERRY_MEN_FROM_PRISON,
          'playerId' => $robinHoodPlayer->getId(),
        ],
      ]
    ]));

    $this->resolveAction(['automatic' => true]);
  }


  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsRoyalInspectionMischief()
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

  public function actPassRoyalInspectionMischief()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actRoyalInspectionMischief($args)
  {
    self::checkAction('actRoyalInspectionMischief');


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