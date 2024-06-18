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


class EventRoyalPardonLight extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_EVENT_ROYAL_PARDON_LIGHT;
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

  public function stEventRoyalPardonLight()
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

  public function argsEventRoyalPardonLight()
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

  public function actPassEventRoyalPardonLight()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actEventRoyalPardonLight($args)
  {
    self::checkAction('actEventRoyalPardonLight');
    $merryMenIds = $args['merryMenIds'];
    $spaceId = $args['spaceId'];

    $options = $this->getOptions();
    $space = Utils::array_find($options['spaces'], function ($optionSpace) use ($spaceId) {
      return $spaceId === $optionSpace->getId();
    });
    if ($space === null) {
      throw new \feException("ERROR 091");
    }
    $input = [];
    foreach($merryMenIds as $merryManId) {
      $merryMan = Utils::array_find($options['forces'], function ($force) use ($merryManId) {
        return $force->getId() === $merryManId;
      });
      if ($merryMan === null) {
        throw new \feException("ERROR 092");
      }
      $input[] = [
        'force' => $merryMan,
        'toSpaceId' => $spaceId,
        'toHidden' => false,
      ];
    }

    $notifData = GameMap::createMoves($input);

    Notifications::royalPardonLight(self::getPlayer(),$notifData['forces'],$notifData['moves'], $space);

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
    $spaces = Spaces::get(NOTTINGHAM)->getAdjacentSpaces();
    $forces = Forces::getInLocation(PRISON)->toArray();
    return [
      'spaces' => $spaces,
      'forces' => $forces,
      'count' => floor(count($forces) / 2),
    ];
  }
}
