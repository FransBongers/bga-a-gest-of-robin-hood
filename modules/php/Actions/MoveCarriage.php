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
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;
use AGestOfRobinHood\Spaces\Nottingham;

class MoveCarriage extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_MOVE_CARRIAGE;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsMoveCarriage()
  {
    $data = [
      '_private' => [
        self::getPlayer()->getId() => [
          'options' => $this->getOptions(),
        ]
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

  public function actPassMoveCarriage()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  // public function actPlayerAction($cardId, $strength)
  public function actMoveCarriage($args)
  {
    self::checkAction('actMoveCarriage');

    $bringHenchman = $args['bringHenchman'];
    $carriageId = $args['carriageId'];
    $toSpaceId = $args['toSpaceId'];

    $options = $this->getOptions();

    if (!isset($options[$carriageId])) {
      throw new \feException("ERROR 004");
    }
    $option = $options[$carriageId];

    if ($bringHenchman && !$option['canBringHenchman']) {
      throw new \feException("ERROR 005");
    }

    $fromSpace = $option['from'];
    $toSpace = Utils::array_find($option['to'], function ($space) use ($toSpaceId) {
      return $space->getId() === $toSpaceId;
    });

    if ($toSpace === null) {
      throw new \feException("ERROR 059");
    }

    $carriage = $option['carriage'];
    $toSpaceId = $toSpace->getId();
    $carriage->setLocation($toSpaceId);

    $henchman = null;
    if ($bringHenchman) {
      $henchman = $fromSpace->getSingleForce(HENCHMEN);
      $henchman->setLocation($toSpaceId);
    }

    $player = self::getPlayer();

    Notifications::moveCarriage($player, $carriage, $fromSpace, $toSpace, $henchman);

    if ($toSpaceId === NOTTINGHAM) {
      if ($carriage->isHidden()) {
        $carriage->reveal();
      }

      $gains = $carriage->getCarriageGainsSheriff();
      $player->incShillings($gains['shillings']);
      Players::moveRoyalFavour($player, $gains['royalFavour'], ORDER);
      $carriage->setLocation(Locations::usedCarriages());
      Notifications::moveCarriageToUsedCarriages($player, $carriage, $toSpace);
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

  private function getAlreadyMovedCarriageIds()
  {
    $resolved = Engine::getResolvedActions([MOVE_CARRIAGE]);

    $moved = [];

    foreach ($resolved as $node) {
      $resolutionArgs = $node->getActionResolutionArgs();
      if ($resolutionArgs === null) {
        continue;
      }
      if (isset($resolutionArgs['carriageId'])) {
        $moved[] = $resolutionArgs['carriageId'];
      }
    }

    return $moved;
  }

  private function getOptions()
  {
    $carriages = GameMap::getCarriagesOnMap();

    $alreadyMovedCarriageIds = $this->getAlreadyMovedCarriageIds();

    $options = [];
    $info = $this->ctx->getInfo();
    $numberOfSpaces = isset($info['numberOfSpaces']) ? $info['numberOfSpaces'] : 1;

    Notifications::log('numberOfSpaces', $numberOfSpaces);

    foreach ($carriages as $carriage) {
      if (in_array($carriage->getId(), $alreadyMovedCarriageIds)) {
        continue;
      }

      $space = Spaces::get($carriage->getLocation());
      $nextSpace = $space->getNextSpaceAlongRoad();
      Notifications::log('nextSpace', $nextSpace);
      $to = [$nextSpace];
      if ($numberOfSpaces === 2 && $nextSpace->getId() !== NOTTINGHAM) {
        $to[] = $nextSpace->getNextSpaceAlongRoad();
      }

      $options[$carriage->getId()] = [
        'from' => $space,
        'to' => $to,
        'carriage' => $carriage,
        'canBringHenchman' => count($space->getForces(HENCHMEN)) > 0
      ];
    }

    return $options;
  }
}
