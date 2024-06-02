<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;

/**
 * TODO: check if this can be removed?
 */
class SetupRobinHood extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_SETUP_ROBIN_HOOD;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsSetupRobinHood()
  {

    $data = [
    ];

    // args['_private'][specificPid]=

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

  public function actPassSetupRobinHood()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  // public function actSetupRobinHood($cardId, $strength)
  public function actSetupRobinHood($args)
  {
    self::checkAction('actSetupRobinHood');
    Notifications::log('actSetupRobinHood', $args);

    $robinHoodLocation = $args['robinHood'];
    $merryMenLocations = $args['merryMen'];

    $allowesSpaces = [SHIRE_WOOD, SOUTHWELL_FOREST, REMSTON];
    if (!in_array($robinHoodLocation, $allowesSpaces)) {
      throw new \feException("ERROR 001");
    }

    foreach($merryMenLocations as $spaceId) {
      if (!in_array($spaceId, $allowesSpaces)) {
        throw new \feException("ERROR 002");
      }
    }

    $robinHood = Forces::get(ROBIN_HOOD);
    $robinHood->setLocation($robinHoodLocation);
    $merryMen = [];
    
    foreach($merryMenLocations as $spaceId) {
      $merryMan = Forces::getTopOf(MERRY_MEN_SUPPLY);
      $merryMan->setLocation($spaceId);
      $merryMen[] = $merryMan;
    }

    Notifications::setupRobinHood(self::getPlayer(), $robinHood, $merryMen);

    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...


}
