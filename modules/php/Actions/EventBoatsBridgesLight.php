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


class EventBoatsBridgesLight extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_EVENT_BOATS_BRIDGES_LIGHT;
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

  public function stEventBoatsBridgesLight()
  {

    // $this->resolveAction(['automatic' => true]);
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventBoatsBridgesLight()
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

  public function actPassEventBoatsBridgesLight()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actEventBoatsBridgesLight($args)
  {
    self::checkAction('actEventBoatsBridgesLight');
    $merryMenIds = $args['merryMenIds'];
    $fromSpaceId = $args['fromSpaceId'];
    $toSpaceId = $args['toSpaceId'];

    $options = $this->getOptions();

    if (!isset($options[$fromSpaceId])) {
      throw new \feException("ERROR 078");
    }

    $possibleToSpacesIds = Utils::filter(SPACES, function ($spaceId) use ($fromSpaceId) {
      return !in_array($spaceId, [$fromSpaceId, SHIRE_WOOD, OLLERTON_HILL]);
    });

    if (!in_array($toSpaceId, $possibleToSpacesIds)) {
      throw new \feException("ERROR 079");
    }

    $option = $options[$fromSpaceId];

    $moveInput = [];

    foreach ($merryMenIds as $merryManId) {
      $merryMan = Utils::array_find($option['merryMen'], function ($force) use ($merryManId) {
        return $merryManId === $force->getId();
      });
      if ($merryMan === null) {
        throw new \feException("ERROR 080");
      }
      $moveInput[] = [
        'force' => $merryMan,
        'toSpaceId' => $toSpaceId,
        'toHidden' => true,
      ];
    }

    $moveOutput = GameMap::createMoves($moveInput);
    Notifications::eventBoatsBridgesLight(self::getPlayer(), $moveOutput['forces'], $moveOutput['moves'], $option['space'], Spaces::get($toSpaceId));

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
    $spaces = Spaces::get(SPACES);
    $forces = Forces::getAll()->toArray();
    $options = [];

    foreach ($spaces as $spaceId => $space) {
      if ($spaceId === SHIRE_WOOD) {
        continue;
      }
      $merryMenInSpace = Utils::filter($forces, function ($force) use ($spaceId) {
        return $force->isMerryMan() && $force->getLocation() === $spaceId;
      });
      if (count($merryMenInSpace) > 0) {
        $options[$spaceId] = [
          'space' => $space,
          'merryMen' => $merryMenInSpace,
        ];
      }
    }
    return $options;
  }
}
