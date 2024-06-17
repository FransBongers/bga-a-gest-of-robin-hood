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
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;
use AGestOfRobinHood\Spaces\Nottingham;

class EventNottinghamFairLight extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_EVENT_NOTTINGHAM_FAIR_LIGHT;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventNottinghamFairLight()
  {
    $henchmen = $this->getOptions();
    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => [
          'forces' => $henchmen,
          'min' => 1,
          'max' => min(count($henchmen), 2),
          'type' => 'private',
          'robinHoodInSupply' => Forces::get(ROBIN_HOOD)->getLocation() === ROBIN_HOOD_SUPPLY,
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

  public function actPassEventNottinghamFairLight()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  // public function actPlayerAction($cardId, $strength)
  public function actEventNottinghamFairLight($args)
  {
    self::checkAction('actEventNottinghamFairLight');
    $henchmenIds = $args['henchmenIds'];
    $placeRobinHood = $args['placeRobinHood'];

    $options = $this->getOptions();

    $henchmen = [];
    foreach($henchmenIds as $henchmanId) {
      $henchman = Utils::array_find($options, function ($force) use ($henchmanId) {
        return $force->getId() === $henchmanId;
      });
      if ($henchman === null) {
        throw new \feException("ERROR 084");
      }
      $henchmen[] = $henchman;
    }
    $player = self::getPlayer();
    foreach($henchmen as $force) {
      $force->returnToSupply($player);
    }

    if ($placeRobinHood && Forces::get(ROBIN_HOOD)->getLocation() !== ROBIN_HOOD_SUPPLY) {
      throw new \feException("ERROR 085");
    }

    // // TODO: allow placement of Robin Hood?
    GameMap::placeMerryMan($player, Spaces::get(NOTTINGHAM), $placeRobinHood, count($henchmen));

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
    $henchmen = Forces::getOfType(HENCHMEN);
    return Utils::filter($henchmen, function ($henchman) {
      return $henchman->getLocation() === NOTTINGHAM;
    });
  }
}
