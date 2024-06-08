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
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class Turncoat extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_TURNCOAT;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsTurncoat()
  {
    $data = [
      '_private' => [
        self::getPlayer()->getId() => [
          'spaces' => $this->getPossibleSpaces(),
          'robinHoodInSupply' => Forces::get(ROBIN_HOOD)->getLocation() === ROBIN_HOOD_SUPPLY,
        ]
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

  public function actPassTurncoat()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actTurncoat($args)
  {
    self::checkAction('actTurncoat');
    $spaceId = $args['spaceId'];
    $placeRobinHood = $args['placeRobinHood'];

    $spaces = $this->getPossibleSpaces();

    $space = Utils::array_find($spaces, function ($possibleSpace) use ($spaceId) {
      return $possibleSpace->getId() === $spaceId;
    });

    if ($space === null) {
      throw new \feException("ERROR 035");
    }

    if ($placeRobinHood && Forces::get(ROBIN_HOOD)->getLocation() !== ROBIN_HOOD_SUPPLY) {
      throw new \feException("ERROR 036");
    }

    $player = self::getPlayer();

    $player->payShillings(1);

    $henchman = Utils::array_find($space->getForces(), function ($force) {
      return $force->isHenchman();
    });

    $henchman->returnToSupply($player);

    $this->placeMerryMan($player, $space, $placeRobinHood);

    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...


  private function placeMerryMan($player, $space, $recruitRobinHood)
  {
    $merryMenToPlace = [];
    $robinHood = null;
    $originalNumber = 1;
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

  public function getName()
  {
    return clienttranslate('Turncoat');
  }

  public function canBePerformed($player)
  {
    if ($player->getShillings() === 0) {
      return false;
    }

    return count($this->getPossibleSpaces()) > 0;
  }

  public function getPossibleSpaces()
  {
    $forces = Forces::getAll()->toArray();

    return Utils::filter(Spaces::get(PARISHES)->toArray(), function ($space) use ($forces) {
      // is revolting
      if (!$space->isRevolting()) {
        return false;
      }
      // has Merry Man
      if (!Utils::array_some($forces, function ($force) use ($space) {
        return $force->getLocation() === $space->getId() && $force->isMerryMan();
      })) {
        return false;
      }
      // has Henchman
      if (!Utils::array_some($forces, function ($force) use ($space) {
        return $force->getLocation() === $space->getId() && $force->isHenchman();
      })) {
        return false;
      }
      return true;
    });
  }
}
