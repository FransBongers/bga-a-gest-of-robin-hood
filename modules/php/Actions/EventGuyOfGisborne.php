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


class EventGuyOfGisborne extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_EVENT_GUY_OF_GISBORNE;
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

  public function stEventGuyOfGisborne()
  {
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventGuyOfGisborne()
  {

    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => [
          'merryMen' => $this->getOptions()
        ]
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

  public function actPassEventGuyOfGisborne()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actEventGuyOfGisborne($args)
  {
    self::checkAction('actEventGuyOfGisborne');
    $merryManId = $args['merryManId'];

    $merryMen = $this->getOptions();

    $merryMan = Utils::array_find($merryMen, function ($force) use ($merryManId) {
      return $force->getId() === $merryManId;
    });

    if ($merryMan === null) {
      throw new \feException("ERROR 073");
    }

    $robinHood = Forces::get(ROBIN_HOOD);
    $fromLocationRH = $robinHood->getLocation();
    $fromLocationMM = $merryMan->getLocation();

    $player = self::getPlayer();

    $space = Spaces::get($fromLocationMM);

    if ($fromLocationRH === ROBIN_HOOD_SUPPLY) {
      $merryMan->returnToSupply($player);
      GameMap::placeMerryMan($player, $space, true);
    } else {
      $robinHood->setLocation($fromLocationMM);
      $robinHood->setHidden(1);
      $merryMan->setLocation($fromLocationRH);
      $merryMan->setHidden(0);
      $moves = [];
      $moves[] = [
        'from' => [
          'type' => $robinHood->isHidden() ? MERRY_MEN : ROBIN_HOOD,
          'hidden' => $robinHood->isHidden(),
          'spaceId' => $fromLocationRH,
        ],
        'to' => [
          'type' => MERRY_MEN,
          'hidden' => true,
          'spaceId' => $fromLocationMM,
        ]
      ];
      $moves[] = [
        'from' => [
          'type' => MERRY_MEN,
          'hidden' => $merryMan->isHidden(),
          'spaceId' => $fromLocationMM,
        ],
        'to' => [
          'type' => MERRY_MEN,
          'hidden' => false,
          'spaceId' => $fromLocationRH,
        ]
      ];
      Notifications::swapRobinHoodGuyOfGisborne(self::getPlayer(), [$robinHood, $merryMan], $moves, $space);
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
    return Utils::filter(Forces::getOfType(MERRY_MEN), function ($merryMan) {
      return in_array($merryMan->getLocation(), SPACES);
    });
  }
}
