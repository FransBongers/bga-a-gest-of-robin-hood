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
    $player = self::getPlayer();

    if (!$this->canBePerformed($player, $player->getShillings())) {
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

  public function argsHire()
  {
    $data = [
      'options' => $this->getOptions(),
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

  public function actPassHire()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actHire($args)
  {
    self::checkAction('actHire');

    $spaceId = $args['spaceId'];
    $count = $args['count'];



    $options = $this->getOptions();

    if (!isset($options[$spaceId])) {
      throw new \feException("ERROR 016");
    }

    $option = $options[$spaceId];

    if ($count > $option['max']) {
      throw new \feException("ERROR 017");
    }

    $space = $option['space'];

    $player = self::getPlayer();
    $player->payShillings(2);
    if ($space->getId() === NOTTINGHAM) {
      $henchmen = $this->moveHenchmen(NOTTINGHAM, $count);
      Notifications::placeHenchmen($player, $henchmen, $space);
    } else if ($space->isSubmissive()) {
      $henchmen = $this->moveHenchmen($space->getId(), $count);
      Notifications::placeHenchmen($player, $henchmen, $space);
    } else if ($space->isRevolting()) {
      $space->setToSubmissive($player);
    }

    $this->insertPlotAction($player);

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
    $availableHenchmen = count(Forces::getInLocation(HENCHMEN_SUPPLY));
    $options = [];

    foreach (Spaces::getAll() as $spaceId => $space) {
      if ($space->isSubmissive() && $availableHenchmen > 0) {
        $options[$spaceId] = [
          'action' => 'place',
          'space' => $space,
          'max' => min($availableHenchmen, $spaceId === NOTTINGHAM ? 4 : 2),
        ];
      } else if ($space->isRevolting()) {
        $forces = $space->getForces();
        $merryMenCount = count(Utils::filter($forces, function ($force) {
          return $force->isMerryMan();
        }));
        $henchMenCount = count(Utils::filter($forces, function ($force) {
          return $force->isHenchMan();
        }));
        if ($henchMenCount > $merryMenCount) {
          $options[$spaceId] = [
            'action' => 'submit',
            'space' => $space,
            'max' => 0,
          ];
        }
      }
    }

    return $options;
  }
}