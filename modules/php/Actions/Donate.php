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


class Donate extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_DONATE;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsDonate()
  {
    $player = self::getPlayer();

    $possible = $this->getPossibleSpaces();
    $data = [
      'spaces' => $possible,
      'max' => min(count($possible), 2, floor($player->getShillings() / 2)),

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

  public function actPassDonate()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actDonate($args)
  {
    self::checkAction('actDonate');

    $selectedSpaceIds = $args['selectedSpaceIds'];

    $stateArgs = $this->argsDonate();

    if (count($selectedSpaceIds) > $stateArgs['max']) {
      throw new \feException("ERROR 023");
    }

    $spaces = Utils::filter($stateArgs['spaces'], function ($space) use ($selectedSpaceIds) {
      return in_array($space->getId(), $selectedSpaceIds);
    });

    if (count($spaces) !== count($selectedSpaceIds)) {
      throw new \feException("ERROR 024");
    }

    $player = self::getPlayer();
    $shillings = $player->getShillings();

    if (count($selectedSpaceIds) * 2 > $shillings) {
      throw new \feException("ERROR 025");
    }

    foreach ($spaces as $space) {
      $player->payShillings(2);
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
    return clienttranslate('Donate');
  }

  public function canBePerformed($player)
  {
    return true;
  }

  public function getPossibleSpaces()
  {
    return Utils::filter(Spaces::get(PARISHES)->toArray(), function ($space) {
      if (!$space->isSubmissive()) {
        return false;
      }
      $forces = $space->getForces();
      $numberOfMerryMen = count(Utils::filter($forces, function ($force) {
        return $force->isMerryMan();
      }));
      $numberOfHenchmen = count(Utils::filter($forces, function ($force) {
        return $force->isHenchman();
      }));
      return $numberOfMerryMen > 0 && $numberOfMerryMen >= $numberOfHenchmen;
    });
  }
}
