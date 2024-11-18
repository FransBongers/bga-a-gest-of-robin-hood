<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Game;
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
use PDO;

class RoyalInspectionSwapRobinHood extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_ROYAL_INSPECTION_SWAP_ROBIN_HOOD;
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

  public function stRoyalInspectionSwapRobinHood()
  {
    if (in_array(Forces::get(ROBIN_HOOD)->getLocation(), [PRISON, REMOVED_FROM_GAME])) {
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

  public function argsRoyalInspectionSwapRobinHood()
  {
    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => [
          'robinHood' => Forces::get(ROBIN_HOOD),
          'merryMen' => $this->getOptions()
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

  public function actPassRoyalInspectionSwapRobinHood()
  {
    $player = self::getPlayer();
    Notifications::swapRobinHood($player, []);
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actRoyalInspectionSwapRobinHood($args)
  {
    self::checkAction('actRoyalInspectionSwapRobinHood');
    $merryManId = $args['merryManId'];

    $merryMan = Utils::array_find($this->getOptions(), function ($option) use ($merryManId) {
      return $option->getId() === $merryManId;
    });

    if ($merryMan === null) {
      throw new \feException("ERROR 053");
    }

    $robinHood = Forces::get(ROBIN_HOOD);
    $fromLocationRH = $robinHood->getLocation();
    $fromLocationMM = $merryMan->getLocation();

    $robinHood->setLocation($fromLocationMM);
    $merryMan->setLocation($fromLocationRH);

    Notifications::swapRobinHood(self::getPlayer(), [$robinHood, $merryMan]);

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
    return Utils::filter(Forces::getOfType(MERRY_MEN), function ($merryMan) {
      return !in_array($merryMan->getLocation(), [PRISON, MERRY_MEN_SUPPLY]);
    });
  }
}
