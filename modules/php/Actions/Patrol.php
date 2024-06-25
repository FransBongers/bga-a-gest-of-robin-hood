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
use AGestOfRobinHood\Models\Force;

class Patrol extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_PATROL;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsPatrol()
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

  public function actPassPatrol()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actPatrol($args)
  {
    self::checkAction('actPatrol');

    $spaceId = $args['spaceId'];
    $henchmenIds = $args['henchmenIds'];

    $options = $this->getOptions();

    $robinHood = Forces::get(ROBIN_HOOD);
    $checkpoint = $robinHood->isHidden() || $robinHood->getLocation() === ROBIN_HOOD_SUPPLY;

    if (!isset($options[$spaceId])) {
      throw new \feException("ERROR 018");
    }

    $option = $options[$spaceId];

    $henchmen = Utils::filter($option['adjacentHenchmen'], function ($henchman) use ($henchmenIds) {
      return in_array($henchman->getId(), $henchmenIds);
    });

    if (count($henchmen) !== count($henchmenIds)) {
      throw new \feException("ERROR 019");
    }

    $moves = [];

    foreach ($henchmen as $henchman) {
      $currentSpaceId = $henchman->getLocation();
      $henchman->setLocation($spaceId);
      if (isset($moves[$currentSpaceId])) {
        $moves[$currentSpaceId]['henchmen'][] = $henchman;
      } else {
        $moves[$currentSpaceId] = [
          'henchmen' => [$henchman],
          'space' => Spaces::get($currentSpaceId),
        ];
      }
    }

    $player = self::getPlayer();
    $info = $this->ctx->getInfo();
    $cost = isset($info['cost']) ? $info['cost'] : 2;
    if ($cost > 0) {
      $player->payShillings($cost);
    }

    $patrolSpace = $option['space'];

    foreach ($moves as $spaceId => $move) {
      Notifications::moveForces($player, $move['space'], $patrolSpace, $move['henchmen']);
    }

    $forcesInSpace = $patrolSpace->getForces();
    $numberOfHenchmen = count(Utils::filter($forcesInSpace, function ($force) {
      return $force->isHenchman();
    }));
    $originalNumber = $numberOfHenchmen;
    $hiddenMerryMen = Utils::filter($forcesInSpace, function ($force) {
      return $force->isMerryMan() && $force->isHidden();
    });
    if ($patrolSpace->isForest()) {
      $numberOfHenchmen = floor($numberOfHenchmen / 2);
    }

    // Notifications::

    $numberOfMerryMenToReveal = min(count($hiddenMerryMen), $numberOfHenchmen);
    if (isset($info['source']) && $info['source'] === 'Event18_AllanADale' && $originalNumber > 0) {
      $numberOfMerryMenToReveal = count($hiddenMerryMen);
    }

    if ($numberOfMerryMenToReveal === 0) {
      $checkpoint = false;
    }

    for ($i = 0; $i < $numberOfMerryMenToReveal; $i++) {
      $index = bga_rand(0, count($hiddenMerryMen) - 1);
      $revealedMerryMan = $hiddenMerryMen[$index];
      $revealedMerryMan->reveal($player);
      $hiddenMerryMen = Utils::filter($hiddenMerryMen, function ($hiddenMerryMan) use ($revealedMerryMan) {
        return $hiddenMerryMan->getId() !== $revealedMerryMan->getId();
      });
    }

    $this->insertPlotAction($player);

    $this->resolveAction($args, $checkpoint);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  public function canBePerformed($player, $availableShillings, $cost = null)
  {
    if (($cost === null && $availableShillings < 2) || ($cost !== null && $availableShillings < $cost)) {
      return false;
    }

    return count($this->getOptions()) > 0;
  }

  public function getName()
  {
    return clienttranslate('Patrol');
  }

  public function getOptions()
  {
    $options = [];

    $alreadyPatrolledspaceIds = [];
    $alreadyMovedHenchmenIds = [];
    $nodes = Engine::getResolvedActions([PATROL]);
    foreach ($nodes as $node) {
      $resArgs = $node->getActionResolutionArgs();
      $alreadyPatrolledspaceIds[] = $resArgs['spaceId'];
      $alreadyMovedHenchmenIds = array_merge($alreadyMovedHenchmenIds, $resArgs['henchmenIds']);
    }

    $forces = Forces::getAll()->toArray();

    foreach (Spaces::getAll() as $spaceId => $space) {
      if ($spaceId === OLLERTON_HILL || in_array($spaceId, $alreadyPatrolledspaceIds)) {
        continue;
      }
      $adjacentSpaceIds = $space->getAdjacentSpaceIds();

      $adjacentHenchmen = Utils::filter($forces, function ($force) use ($adjacentSpaceIds, $alreadyMovedHenchmenIds) {
        return $force->isHenchman() && in_array($force->getLocation(), $adjacentSpaceIds) && !in_array($force->getId(), $alreadyMovedHenchmenIds);
      });
      $countHenchmenInSpace = Utils::filter($forces, function ($force) use ($spaceId) {
        return $force->isHenchman() && $force->getLocation() === $spaceId;
      });
      $spaceHasHiddenMerryMen = Utils::array_some($forces, function ($force) use ($spaceId) {
        return $force->isMerryMan() && $force->isHidden() && $force->getLocation() === $spaceId;
      });
      $isForest = in_array($spaceId, [SHIRE_WOOD, SOUTHWELL_FOREST]);
      if (
        count($adjacentHenchmen) > 0 ||
        ($isForest && $countHenchmenInSpace >= 2 && $spaceHasHiddenMerryMen) ||
        (!$isForest && $countHenchmenInSpace > 0 && $spaceHasHiddenMerryMen)
      ) {
        $options[$spaceId] = [
          'space' => $space,
          'adjacentHenchmen' => $adjacentHenchmen,
        ];
      }
    }

    return $options;
  }
}
