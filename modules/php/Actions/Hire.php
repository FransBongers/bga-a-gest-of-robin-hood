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


class Hire extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_HIRE;
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

  public function stHire()
  {
    $info = $this->ctx->getInfo();
    $spaceIds = $info['spaceIds'];



    $spaces = Spaces::getMany($spaceIds)->toArray();
    $player = self::getPlayer();

    foreach ($spaces as $space) {
      $player->payShillings(2);
      if ($space->getId() === NOTTINGHAM) {
        $henchmen = $this->moveHenchmen(NOTTINGHAM, 4);
        Notifications::placeHenchmen($player, $henchmen, $space);
      } else if ($space->isSubmissive()) {
        $henchmen = $this->moveHenchmen($space->getId(), 2);
        Notifications::placeHenchmen($player, $henchmen, $space);
      } else if ($space->isRevolting()) {
        $space->setToSubmissive($player);
      }
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

  public function argsHire()
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

  public function actPassHire()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actHire($args)
  {
    self::checkAction('actHire');



    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  public function canBePerformed($player, $availableShillings)
  {
    if ($availableShillings < 2) {
      return false;
    }

    return count($this->getOptions()) > 0;
  }

  public function getName()
  {
    return clienttranslate('Hire');
  }

  private function moveHenchmen($spaceId, $number)
  {
    $result = [];
    for ($i = 0; $i < $number; $i++) {
      $henchman = Forces::getTopOf(HENCHMEN_SUPPLY);
      if ($henchman === null) {
        continue;
      }
      $henchman->setLocation($spaceId);
      $result[] = $henchman;
    }
    return $result;
  }

  public function getOptions()
  {
    $spaces = Utils::filter(Spaces::getAll()->toArray(), function ($space) {
      if ($space->isSubmissive()) {
        return true;
      } else if ($space->isRevolting()) {
        $forces = $space->getForces();
        $merryMenCount = count(Utils::filter($forces, function ($force) {
          return $force->isMerryMan();
        }));
        $henchMenCount = count(Utils::filter($forces, function ($force) {
          return $force->isHenchMan();
        }));
        return $henchMenCount > $merryMenCount;
      }
      return false;
    });
    return $spaces;
  }
}
