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


class Ride extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_RIDE;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsRide()
  {
    $data = [
      'spaces' => Spaces::get(PARISHES)->toArray(),
      'henchmen' => $this->getHenchmenInNottingham(),
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

  public function actPassRide()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actRide($args)
  {
    self::checkAction('actRide');

    $spaceId = $args['spaceId'];
    $henchmenIds = $args['henchmenIds'];

    if (!in_array($spaceId, PARISHES)) {
      throw new \feException("ERROR 020");
    }

    $toSpace = Spaces::get($spaceId);

    $henchmen = Utils::filter($this->getHenchmenInNottingham(), function ($henchman) use ($henchmenIds) {
      return in_array($henchman->getId(), $henchmenIds);
    });


    if (count($henchmen) !== count($henchmenIds)) {
      throw new \feException("ERROR 021");
    }

    if (count($henchmen) > 4) {
      throw new \feException("ERROR 022");
    }


    foreach($henchmen as $henchman) {
      $henchman->setLocation($spaceId);
    }

    $player = self::getPlayer();

    Notifications::moveForces($player, Spaces::get(NOTTINGHAM), $toSpace, $henchmen);

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
    return clienttranslate('Ride');
  }

  public function canBePerformed($player, $mayUseAnyMerryMen = false)
  {
    return count($this->getHenchmenInNottingham()) > 0;
  }

  private function getHenchmenInNottingham()
  {
    return Utils::filter(Spaces::get(NOTTINGHAM)->getForces(), function ($force) {
      return $force->isHenchman();
    });
  }
}
