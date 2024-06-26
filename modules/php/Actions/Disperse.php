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
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class Disperse extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_DISPERSE;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsDisperse()
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

  public function actPassDisperse()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actDisperse($args)
  {
    self::checkAction('actDisperse');

    $spaceId = $args['spaceId'];
    $camps = $args['camps'];
    $merryMen = $args['merryMen'];

    $options = $this->getOptions();

    if (!isset($options[$spaceId])) {
      throw new \feException("ERROR 040");
    }

    if (count($camps) + count($merryMen) > 2) {
      throw new \feException("ERROR 041");
    }

    $option = $options[$spaceId];
    $space = $option['space'];

    $forces = $space->getForces();

    $merryMenInSpace = Utils::filter($forces, function ($force) {
      return $force->isMerryMan();
    });

    $numberOfMerryMenInSpace = count($merryMenInSpace);

    $campsInSpace = Utils::filter($forces, function ($force) {
      return $force->isCamp();
    });

    $selectedMerryMen = [];
    foreach ($merryMen as $merryMenOption) {
      $matchingMerryMen = Utils::filter($merryMenInSpace, function ($merryMan) use ($merryMenOption) {
        if ($merryMenOption['hidden'] !== $merryMan->isHidden()) {
          return false;
        }
        if (!$merryMenOption['hidden'] && $merryMenOption['type'] === ROBIN_HOOD && !$merryMan->isRobinHood()) {
          return false;
        }
        return true;
      });
      if (count($matchingMerryMen) === 0) {
        throw new \feException("ERROR 042");
      }
      $selectedMerryMan = $matchingMerryMen[bga_rand(0, count($matchingMerryMen) - 1)];
      $selectedMerryMen[] = $selectedMerryMan;
      $merryMenInSpace = Utils::filter($merryMenInSpace, function ($force) use ($selectedMerryMan) {
        return $force->getId() !== $selectedMerryMan->getId();
      });
    }

    $selectedCamps = [];
    foreach ($camps as $campOption) {
      $matchingCamps = Utils::filter($campsInSpace, function ($camp) use ($campOption) {
        return $campOption['hidden'] === $camp->isHidden();
      });
      if (count($matchingCamps) === 0) {
        throw new \feException("ERROR 043");
      }
      $selectedCamp = $matchingCamps[bga_rand(0, count($matchingCamps) - 1)];
      $selectedCamps[] = $selectedCamp;
      $campsInSpace = Utils::filter($campsInSpace, function ($force) use ($selectedCamp) {
        $force->getId() !== $selectedCamp->getId();
      });
    }

    if (count($selectedMerryMen) < $numberOfMerryMenInSpace && count($selectedCamps) > 0) {
      throw new \feException("ERROR 044");
    }

    $player = self::getPlayer();
    $player->payShillings(3);

    Notifications::disperse($player, $space, $merryMen, $camps);

    foreach ($selectedMerryMen as $merryMan) {
      $merryMan->returnToSupply($player);
    }
    foreach ($selectedCamps as $camp) {
      $camp->returnToSupply($player);
    }
    // Select a force for each input piece
    if (!$space->isRevolting()) {
      $space->revolt($player);
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

  public function getName()
  {
    return clienttranslate('Disperse');
  }

  public function canBePerformed($player, $mayUseAnyMerryMen = false)
  {
    if ($player->getShillings() < 3) {
      return false;
    }

    return count($this->getOptions()) > 0;
  }

  public function getOptions()
  {
    $options = [];

    $parishes = Spaces::get(PARISHES);

    foreach ($parishes as $spaceId => $space) {
      $forces = $space->getForces();

      $hasHenchmen = Utils::array_some($forces, function ($force) {
        return $force->isHenchman();
      });

      if (!$hasHenchmen) {
        continue;
      }

      $merryMen = Utils::filter($forces, function ($force) {
        return $force->isMerryMan();
      });

      $camps = Utils::filter($forces, function ($force) {
        return $force->isCamp();
      });

      if (count($merryMen) + count($camps) === 0) {
        continue;
      }
      $options[$spaceId] = [
        'space' => $space,
        'merryMen' => array_map(function ($merryMan) {
          return [
            'type' => $merryMan->isRobinHood() && !$merryMan->isHidden() ? ROBIN_HOOD : MERRY_MEN,
            'hidden' => $merryMan->isHidden(),
          ];
        }, $merryMen),
        'camps' => array_map(function ($camp) {
          return [
            'type' => CAMP,
            'hidden' => $camp->isHidden(),
          ];
        }, $camps),
      ];
    }

    return $options;
  }
}
