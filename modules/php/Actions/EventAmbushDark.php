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
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;
use AGestOfRobinHood\Spaces\Nottingham;

class EventAmbushDark extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_EVENT_AMBUSH_DARK;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventAmbushDark()
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

  public function actPassEventAmbushDark()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  // public function actPlayerAction($cardId, $strength)
  public function actEventAmbushDark($args)
  {
    self::checkAction('actEventAmbushDark');


    $spaceId = $args['spaceId'];

    $options = $this->getOptions();

    if (!$options[$spaceId]) {
      throw new \feException("ERROR 057");
    }

    $forces = Forces::getInLocation($spaceId)->toArray();
    $player = self::getPlayer();

    foreach($forces as $force) {
      if ($force->isMerryMan() && $force->isHidden()) {
        $force->reveal($player);
      }
    }

    Players::moveRoyalFavour($player,1 , ORDER);

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
    $options = [];
    foreach ([SHIRE_WOOD, SOUTHWELL_FOREST] as $spaceId) {
      $options[$spaceId] = Utils::array_some(Forces::getInLocation($spaceId)->toArray(), function ($force) {
        return $force->isMerryMan() && $force->isHidden();
      });
    }
    return $options;
  }
}
