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


class RoyalInspectionReturnMerryMenFromPrison extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_ROYAL_INSPECTION_RETURN_MERRY_MEN_FROM_PRISON;
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

  public function stRoyalInspectionReturnMerryMenFromPrison()
  {
    $options = $this->getOptions();
    if ($options['robinHoodInPrison']) {
      return;
    }
    $merryMen = $options['merryMen'];
    shuffle($merryMen);
    $player = self::getPlayer();
    for ($i = 0; $i < $options['numberToReturn']; $i++) {
      $merryMen[$i]->returnToSupply($player);
    }
    $this->resolveAction(['automatic' => true]);
  }


  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsRoyalInspectionReturnMerryMenFromPrison()
  {
    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => $this->getOptions(),
      ],
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

  public function actPassRoyalInspectionReturnMerryMenFromPrison()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actRoyalInspectionReturnMerryMenFromPrison($args)
  {
    self::checkAction('actRoyalInspectionReturnMerryMenFromPrison');
    $merryManIds = $args['merryManIds'];

    $stateArgs = $this->getOptions();

    $merryMen = Utils::filter($stateArgs['merryMen'], function ($force) use ($merryManIds) {
      return in_array($force->getId(), $merryManIds);
    });

    if (count($merryMen) !== count($merryManIds)) {
      throw new \feException("ERROR 047");
    }

    $player = self::getPlayer();

    foreach ($merryMen as $merryMan) {
      $merryMan->returnToSupply($player);
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

  private function getOptions()
  {
    $merryMen = Forces::getInLocation(PRISON)->toArray();

    return [
      'merryMen' => $merryMen,
      'numberToReturn' => floor(count($merryMen) / 2),
      'robinHoodInPrison' => Utils::array_some($merryMen, function ($merryMan) {
        return $merryMan->isRobinHood();
      }),
    ];
  }
}
