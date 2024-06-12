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


class EventATaleOfTwoLoversLight extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_EVENT_A_TALE_OF_TWO_LOVERS_LIGHT;
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

  public function stEventATaleOfTwoLoversLight()
  {

    // $this->resolveAction(['automatic' => true]);
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventATaleOfTwoLoversLight()
  {

    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => $this->getOptions(),
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

  public function actPassEventATaleOfTwoLoversLight()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actEventATaleOfTwoLoversLight($args)
  {
    self::checkAction('actEventATaleOfTwoLoversLight');
    $spaceId = $args['spaceId'];
    $merryManId = $args['merryManId'];
    $henchmenCount = $args['henchmenCount'];

    $options = $this->getOptions();

    if (!isset($options[$spaceId])) {
      throw new \feException("ERROR 066");
    }

    $option = $options[$spaceId];

    $merryMan = Utils::array_find($option['merryMen'], function ($force) use ($merryManId) {
      return $force->getId() === $merryManId;
    });
    if ($merryMan === null) {
      throw new \feException("ERROR 067");
    }

    if ($henchmenCount > count($option['henchmen'])) {
      throw new \feException("ERROR 068");
    }

    $player = self::getPlayer();

    $merryMan->removeFromGame($player);

    for ($i = 0; $i < $henchmenCount; $i++) {
      $option['henchmen'][$i]->removeFromGame($player);
    }

    Players::moveRoyalFavour($player, 1, JUSTICE);

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
    $options = GameMap::getSpacesWithMerryMen();

    $henchmen = Forces::getOfType(HENCHMEN);

    foreach ($options as $spaceId => $option) {
      $henchmenInSpace = Utils::filter($henchmen, function ($force) use ($spaceId) {
        return $force->getLocation() === $spaceId;
      });
      $options[$spaceId]['henchmen'] = $henchmenInSpace;
    }
    return $options;
  }
}
