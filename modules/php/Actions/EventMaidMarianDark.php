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
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class EventMaidMarianDark extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_EVENT_MAID_MARIAN_DARK;
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

  public function stEventMaidMarianDark()
  {
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventMaidMarianDark()
  {

    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => $this->getOptions(),
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

  public function actPassEventMaidMarianDark()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actEventMaidMarianDark($args)
  {
    self::checkAction('actEventMaidMarianDark');
    $carriageId = $args['carriageId'];
    $spaceId = $args['spaceId'];
    $merryMenSpaceId = $args['merryMenSpaceId'];

    $options = $this->getOptions();

    $carriage = Utils::array_find($options['carriages'], function ($force) use ($carriageId) {
      return $carriageId === $force->getId();
    });
    if ($carriage === null) {
      throw new \feException("ERROR 095");
    }

    $spaceOption = Utils::array_find($options['spaces'], function ($option) use ($spaceId) {
      return $option['space']->getId() === $spaceId;
    });
    if ($spaceOption === null) {
      throw new \feException("ERROR 096");
    }
    if ($spaceOption['hasMerryMen'] && $merryMenSpaceId === null) {
      throw new \feException("ERROR 097");
    }

    $space = $spaceOption['space'];
    $player = self::getPlayer();

    if ($merryMenSpaceId !== null && !in_array($merryMenSpaceId, $spaceOption['adjacentSpacesIds'])) {
      throw new \feException("ERROR 098");
    }

    $carriage->setLocation(Locations::usedCarriages());
    Notifications::moveCarriageToUsedCarriages($player, $carriage);

    if ($space->isRevolting()) {
      $space->setToSubmissive($player);
    }
    if ($spaceOption['hasMerryMen']) {
      $merryMen = Utils::filter($space->getForces(), function ($force) {
        return $force->isMerryMan();
      });
      $notifData = GameMap::createMoves(array_map(function ($merryMan) use ($merryMenSpaceId) {
        return [
          'force' => $merryMan,
          'toSpaceId' => $merryMenSpaceId,
          'toHidden' => $merryMan->isHidden(),
        ];
      }, $merryMen));
      Notifications::maidMarianDark($player, $notifData['forces'], $notifData['moves'], $space, Spaces::get($merryMenSpaceId));
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

  public function getOptions()
  {
    $carriages = Utils::filter(Forces::getAll()->toArray(), function ($force) {
      return $force->isCarriage() && in_array($force->getLocation(), SPACES);
    });
    $parishes = Spaces::get(PARISHES)->toArray();

    $spaces = [];
    foreach ($parishes as $parish) {
      if ($parish->getStatus() === PASSIVE) {
        continue;
      }
      $hasMerryMen = Utils::array_some($parish->getForces(), function ($force) {
        return $force->isMerryMan();
      });
      if (!$hasMerryMen && $parish->isSubmissive()) {
        continue;
      }
      $spaces[] = [
        'space' => $parish,
        'hasMerryMen' => $hasMerryMen,
        'adjacentSpacesIds' => $parish->getAdjacentSpaceIds(),
      ];
    }
    return [
      'spaces' => $spaces,
      'carriages' => $carriages,
    ];
  }
}
