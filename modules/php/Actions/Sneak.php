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


class Sneak extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_SNEAK;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsSneak()
  {
    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => [
          'options' => $this->getOptions()
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

  public function actPassSneak()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actSneak($args)
  {
    self::checkAction('actSneak');
    $argMoves = $args['moves'];
    $spaceId = $args['spaceId'];

    $options = $this->getOptions();

    if (!isset($options[$spaceId])) {
      throw new \feException("ERROR 013");
    }

    $option = $options[$spaceId];
    $forces = [];
    $moves = [];

    foreach ($argMoves as $toSpaceId => $merryMenIds) {
      $toSpace = Utils::array_find($option['adjacentSpaces'], function ($space) use ($toSpaceId) {
        return $space->getId() === $toSpaceId;
      });

      if ($toSpace === null) {
        throw new \feException("ERROR 014");
      }

      $revealMerryMen = $toSpace->isSubmissive() && count(Utils::filter($toSpace->getForces(), function ($force) {
        return $force->isHenchman();
      })) + count($argMoves[$toSpaceId]) > 3;

      $merryMen = [];
      foreach ($merryMenIds as $merryManId) {
        $merryMan = Utils::array_find($option['merryMen'], function ($force) use ($merryManId) {
          return $force->getId() === $merryManId;
        });
        if ($merryMan === null) {
          throw new \feException("ERROR 015");
        }
        $merryMen[] = $merryMan;


        // $currentLocation = $merryMan->getLocation();
        // $startsHidden = $merryMan->isHidden();
        // $merryMan->setLocation($toSpaceId);
        // $forces[] = $merryMan;
        // $moves[] = [
        //   'from' => [
        //     'type' => $this->getMerryMenTypeForMove($merryMan->getType(), $startsHidden),
        //     'hidden' => $merryMan->isHidden(),
        //     'spaceId' => $currentLocation,
        //   ],
        //   'to' => [
        //     'type' => $this->getMerryMenTypeForMove($merryMan->getType(), !$revealMerryMen),
        //     'hidden' => !$revealMerryMen,
        //     'spaceId' => $toSpaceId,
        //   ]
        // ];
        // *   'force' => $force,
        // *   'toSpaceId' => $spaceId,
        // *   'toHidden' => true,

      }
      $notifData = GameMap::createMoves(array_map(function ($merryMan) use ($toSpaceId, $revealMerryMen) {
        return [
          'force' => $merryMan,
          'toSpaceId' => $toSpaceId,
          'toHidden' => !$revealMerryMen,
        ];
      }, $merryMen));
      $forces = array_merge($forces, $notifData['forces']);
      $moves = array_merge($moves, $notifData['moves']);
    }

    $movedMerryMenIds = array_map(function ($force) {
      return $force->getId();
    }, $forces);

    $player = self::getPlayer();
    $info = $this->ctx->getInfo();
    $cost = isset($info['cost']) ? $info['cost'] : 1;

    if ($cost > 0) {
      $player->payShillings($cost);
    }

    Notifications::sneakMerryMen($player, $forces, $moves, $option['space']);

    $this->insertPlotAction($player);

    $this->resolveAction([
      'merryMenIds' => $movedMerryMenIds,
      'fromSpaceId' => $spaceId,
    ]);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  public function getMerryMenTypeForMove($type, $isHidden)
  {
    if ($isHidden) {
      return MERRY_MEN;
    } else {
      return $type;
    }
  }

  public function canBePerformed($player, $availableShillings, $cost = null)
  {
    if (($cost === null && $availableShillings === 0) || ($cost !== null && $availableShillings < $cost)) {
      return false;
    }

    return GameMap::merryManAreOnTheMap();
  }

  public function getName()
  {
    return clienttranslate('Sneak');
  }

  public function getOptions()
  {
    $alreadyMovedspaceIds = [];
    $alreadyMovedMerryMenIds = [];
    $nodes = Engine::getResolvedActions([SNEAK]);
    foreach ($nodes as $node) {
      $resArgs = $node->getActionResolutionArgs();
      $alreadyMovedspaceIds[] = $resArgs['fromSpaceId'];
      $alreadyMovedMerryMenIds = array_merge($alreadyMovedMerryMenIds, $resArgs['merryMenIds']);
    }

    $options = [];

    $forces = Forces::getAll()->toArray();
    $spaces = Spaces::getAll();

    foreach ($spaces as $spaceId => $space) {
      if (in_array($spaceId, $alreadyMovedspaceIds)) {
        continue;
      }
      $merryMenInSpace = Utils::filter($forces, function ($force) use ($alreadyMovedMerryMenIds, $spaceId) {
        return $force->isMerryMan() && $force->getLocation() === $spaceId && !in_array($force->getId(), $alreadyMovedMerryMenIds);
      });
      if (count($merryMenInSpace) === 0) {
        continue;
      }
      $options[$spaceId] = [
        'space' => $space,
        'merryMen' => $merryMenInSpace,
        'adjacentSpaces' => $space->getAdjacentSpaces(),
      ];
    }


    return $options;
  }
}
