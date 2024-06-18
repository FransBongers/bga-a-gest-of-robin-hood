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

class EventWillStutelyLight extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_EVENT_WILL_STUTELY_LIGHT;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventWillStutelyLight()
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

  public function actPassEventWillStutelyLight()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  // public function actPlayerAction($cardId, $strength)
  public function actEventWillStutelyLight($args)
  {
    self::checkAction('actEventWillStutelyLight');
    $merryManId = $args['merryManId'];
    $parishId = $args['parishId'];

    $options = $this->getOptions();

    if (!isset($options[$merryManId])) {
      throw new \feException("ERROR 086");
    }

    $option = $options[$merryManId];

    if (!in_array($parishId, $option['adjacentParishIds'])) {
      throw new \feException("ERROR 087");
    }

    $parish = Spaces::get($parishId);
    $henchmenInParish = Utils::filter($parish->getForces(), function ($force) {
      return $force->isHenchman();
    });

    $move = GameMap::createMoves([
      [
        'force' => $option['merryMan'],
        'toSpaceId' => $parishId,
        'toHidden' => true,
      ]
    ]);

    $player = self::getPlayer();
    Notifications::willStutelyLight($player, $move['forces'], $move['moves'], $parish);

    if (count($henchmenInParish) > 0) {
      Forces::move(array_map(function ($force) {
        return $force->getId();
      }, $henchmenInParish), NOTTINGHAM);
      Notifications::moveForces($player, $parish, Spaces::get(NOTTINGHAM), $henchmenInParish);
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
    $merryMen = Forces::getOfType(MERRY_MEN);
    $merryMen[] = Forces::get(ROBIN_HOOD);
    $spaces = Spaces::getAll()->toArray();

    $options = [];

    foreach ($merryMen as $merryMan) {
      if (!$merryMan->isHidden() || !in_array($merryMan->getLocation(), SPACES)) {
        continue;
      }
      $spaceId = $merryMan->getLocation();
      $merryManSpace = Utils::array_find($spaces, function ($space) use ($spaceId) {
        return $space->getId() === $spaceId;
      });
      $adjacentParishIds = Utils::filter($merryManSpace->getAdjacentSpacesIds(), function ($spaceId) {
        return in_array($spaceId, PARISHES);
      });
      if (count($adjacentParishIds) > 0) {
        $options[$merryMan->getId()] = [
          'merryMan' => $merryMan,
          'adjacentParishIds' => $adjacentParishIds,
        ];
      }
    }
    return $options;
  }
}
