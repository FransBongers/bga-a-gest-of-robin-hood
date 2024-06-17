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

class EventAmbushLight extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_EVENT_AMBUSH_LIGHT;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventAmbushLight()
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

  public function actPassEventAmbushLight()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  // public function actPlayerAction($cardId, $strength)
  public function actEventAmbushLight($args)
  {
    self::checkAction('actEventAmbushLight');
    $spaceId = $args['spaceId'];
    $merryMenIds = $args['merryMenIds'];

    $options = $this->getOptions();

    if (!in_array($spaceId, $options['spaceIds'])) {
      throw new \feException("ERROR 081");
    }

    $moveInput = [];

    foreach ($merryMenIds as $merryManId) {
      $merryMan = Utils::array_find($options['merryMen'], function ($force) use ($merryManId) {
        return $merryManId === $force->getId();
      });
      if ($merryMan === null) {
        throw new \feException("ERROR 082");
      }
      $moveInput[] = [
        'force' => $merryMan,
        'toSpaceId' => $spaceId,
        'toHidden' => true,
      ];
    }

    $output = GameMap::createMoves($moveInput);
    $player = self::getPlayer();
    Notifications::ambushLight($player, $output['forces'], $output['moves'], Spaces::get($spaceId));

    $robAction = AtomicActions::get(ROB);

    if (count($robAction->getOptions([$spaceId])) > 0) {
      $this->ctx->insertAsBrother(new LeafNode([
        'action' => ROB,
        'playerId' => $player->getId(),
        'spaceIds' => [$spaceId]
      ]));
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
    $forces = Forces::getAll()->toArray();
    $spaceIds = [];
    $merryMen = [];
    foreach ($forces as $force) {
      if (!in_array($force->getLocation(), SPACES)) {
        continue;
      }
      if ($force->isMerryMan()) {
        $merryMen[] = $force;
      } else if (in_array($force->getType(), CARRIAGE_TYPES) && !in_array($force->getLocation(), $spaceIds)) {
        $spaceIds[] = $force->getLocation();
      }
    }

    return [
      'merryMen' => $merryMen,
      'spaceIds' => $spaceIds
    ];
  }
}
