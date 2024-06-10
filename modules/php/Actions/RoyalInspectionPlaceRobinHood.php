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
use PDO;

class RoyalInspectionPlaceRobinHood extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_ROYAL_INSPECTION_PLACE_ROBIN_HOOD;
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

  public function stRoyalInspectionPlaceRobinHood()
  {
    if (Forces::get(ROBIN_HOOD)->getLocation() !== ROBIN_HOOD_SUPPLY) {
      $this->resolveAction(['automatic' => true]);
    }
  }


  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsRoyalInspectionPlaceRobinHood()
  {
    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => [
          'spaces' => $this->getOptions()
        ],
      ]
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

  public function actPassRoyalInspectionPlaceRobinHood()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actRoyalInspectionPlaceRobinHood($args)
  {
    self::checkAction('actRoyalInspectionPlaceRobinHood');
    $spaceId = $args['spaceId'];

    $space = Utils::array_find($this->getOptions(), function ($option) use ($spaceId) {
      return $option->getId() === $spaceId;
    });

    if ($space === null) {
      throw new \feException("ERROR 054");
    }

    $this->placeMerryMen(self::getPlayer(), PLACE_MERRY_MAN, $space, true);

    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private function placeMerryMen($player, $recruitOption, $space, $recruitRobinHood)
  {
    $merryMenToPlace = [];
    $robinHood = null;
    $originalNumber = $recruitOption === PLACE_MERRY_MAN ? 1 : 2;
    $numberToPlace = $originalNumber;
    $spaceId = $space->getId();

    if ($recruitRobinHood) {
      $robinHood = Forces::get(ROBIN_HOOD);
      $robinHood->setLocation($spaceId);
      $numberToPlace--;
    }

    for ($i = 0; $i < $numberToPlace; $i++) {
      $merryMan = Forces::getTopOf(MERRY_MEN_SUPPLY);
      $merryMan->setLocation($spaceId);
      $merryMenToPlace[] = $merryMan;
    }

    Notifications::recruitMerryMen($player, $originalNumber, $robinHood, $merryMenToPlace, $space);
  }

  public function getOptions()
  {
    return Spaces::get([SHIRE_WOOD, SOUTHWELL_FOREST])->toArray();
  }
}
