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
          'options' => $this->getArgs()
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
    $merryMenIds = $args['merryMenIds'];
    $toSpaceId = $args['toSpaceId'];
    $fromSpaceId = $args['fromSpaceId'];

    $options = $this->getArgs();

    if (!isset($options[$fromSpaceId])) {
      throw new \feException("ERROR 013");
    }

    $option = $options[$fromSpaceId];
    $merryMen = Utils::filter($option['merryMen'], function ($merryMan) use ($merryMenIds) {
      return in_array($merryMan->getId(), $merryMenIds);
    });

    if (count($merryMenIds) !== count($merryMen)) {
      throw new \feException("ERROR 014");
    }

    $toSpace = Utils::array_find($option['adjacentSpaces'], function ($space) use ($toSpaceId) {
      return $space->getId() === $toSpaceId;
    });

    if ($toSpace === null) {
      throw new \feException("ERROR 015");
    }

    $forcesInSpace = Utils::filter($toSpace->getForces(), function ($force) {
      return $force->isMerryMan() || $force->isHenchman();
    });
    $revealMerryMen = $toSpace->isSubmissive() && count($forcesInSpace) + count($merryMenIds) > 3;

    $moves = [
      'reveal' => 0,
      'hide' => 0,
      'noChange' => [
        'hidden' => 0,
        'revealed' => 0,
      ],
      'robinHood' => null,
    ];

    foreach ($merryMen as $merryMan) {
      $merryMan->setLocation($toSpaceId);
      $isHidden = $merryMan->isHidden();
      $isRobinHood = $merryMan->isRobinHood();
      if ($revealMerryMen && $isHidden) {
        $merryMan->setHidden(0);
        if ($isRobinHood) {
          $moves['robinHood'] = 'reveal';
        } else {
          $moves['reveal']++;
        }
      } else if (($revealMerryMen && !$isHidden) || (!$revealMerryMen && $isHidden)) {
        if ($isRobinHood && !$isHidden) {
          $moves['robinHood'] = 'noChange';
        } else {
          $moves['noChange'][$isHidden ? 'hidden' : 'revealed']++;
        }
      } else if (!$revealMerryMen && !$isHidden) {
        $merryMan->setHidden(1);
        if ($isRobinHood) {
          $moves['robinHood'] = 'hide';
        } else {
          $moves['hide']++;
        }
      }
    }

    $player = self::getPlayer();
    $player->payShillings(1);

    Notifications::sneakMerryMen($player, $merryMen, $moves, $option['space'], $toSpace);

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
    if ($availableShillings === 0) {
      return false;
    }

    return count(GameMap::getSpacesWithMerryMen()) > 0;
  }

  public function getName()
  {
    return clienttranslate('Sneak');
  }

  public function getArgs()
  {
    $info = $this->ctx->getInfo();
    $spaceIds = $info['spaceIds'];

    $alreadyMovedspaceIds = [];
    $alreadyMovedMerryMenIds = [];
    $nodes = Engine::getResolvedActions([SNEAK]);
    foreach ($nodes as $node) {
      $resArgs = $node->getActionResolutionArgs();
      $alreadyMovedspaceIds[] = $resArgs['fromSpaceId'];
      $alreadyMovedMerryMenIds = array_merge($alreadyMovedMerryMenIds, $resArgs['merryMenIds']);
    }

    $options = [];
    // TODO: exclude already moved spaces and merry man

    $spaces = Spaces::get($spaceIds)->toArray();

    foreach ($spaces as $space) {
      if (in_array($space->getId(), $alreadyMovedspaceIds)) {
        continue;
      }
      $forces = $space->getForces();
      $merryMen = Utils::filter($forces, function ($force) use ($alreadyMovedMerryMenIds) {
        return $force->isMerryMan() && !in_array($force->getId(), $alreadyMovedMerryMenIds);
      });
      $options[$space->getId()] = [
        'space' => $space,
        'merryMen' => $merryMen,
        'adjacentSpaces' => $space->getAdjacentSpaces(),
      ];
    }

    return $options;
  }

  public function getOptions()
  {
    return GameMap::getSpacesWithMerryMen();
  }
}
