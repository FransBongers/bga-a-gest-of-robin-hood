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

class EventReplaceHenchmen extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_EVENT_REPLACE_HENCHMEN;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventReplaceHenchmen()
  {
    $info = $this->ctx->getInfo();
    $cardId = $info['cardId'];
    $henchmen = $this->getOptions($cardId);
    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => [
          'forces' => $henchmen,
          'min' => 1,
          'max' => min(count($henchmen), $cardId === 'Event28_NottinghamFair' ? 2 : 1),
          'type' => 'private',
          'robinHoodInSupply' => Forces::get(ROBIN_HOOD)->getLocation() === ROBIN_HOOD_SUPPLY,
          'cardId' => $cardId,
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

  public function actPassEventReplaceHenchmen()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  // public function actPlayerAction($cardId, $strength)
  public function actEventReplaceHenchmen($args)
  {
    self::checkAction('actEventReplaceHenchmen');
    $henchmenIds = $args['henchmenIds'];
    $placeRobinHood = $args['placeRobinHood'];

    $info = $this->ctx->getInfo();
    $cardId = $info['cardId'];
    $options = $this->getOptions($cardId);

    $henchmen = [];
    foreach ($henchmenIds as $henchmanId) {
      $henchman = Utils::array_find($options, function ($force) use ($henchmanId) {
        return $force->getId() === $henchmanId;
      });
      if ($henchman === null) {
        throw new \feException("ERROR 084");
      }
      $henchmen[] = $henchman;
    }

    $player = self::getPlayer();
    $cost = isset($info['cost']) ? $info['cost'] : 0;
    if ($cost > 0) {
      $player->payShillings($cost);
    }

    $location = $cardId === 'Event28_NottinghamFair' ? NOTTINGHAM : $henchmen[0]->getLocation();
    foreach ($henchmen as $force) {
      $force->returnToSupply($player);
    }

    if ($placeRobinHood && Forces::get(ROBIN_HOOD)->getLocation() !== ROBIN_HOOD_SUPPLY) {
      throw new \feException("ERROR 085");
    }
    
    GameMap::placeMerryMan($player, Spaces::get($location), $placeRobinHood, count($henchmen));

    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  public function getOptions($cardId)
  {
    $henchmen = Forces::getOfType(HENCHMEN);
    if ($cardId === 'Event28_NottinghamFair') {
      return Utils::filter($henchmen, function ($henchman) {
        return $henchman->getLocation() === NOTTINGHAM;
      });
    } else if ($cardId === 'Event26_Corruption') {
      return Utils::filter($henchmen, function ($henchman) {
        return in_array($henchman->getLocation(), SPACES);
      });
    }
    return [];
  }
}
