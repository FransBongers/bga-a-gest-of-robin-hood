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


class EventGreatEscapeLight extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_EVENT_GREAT_ESCAPE_LIGHT;
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

  public function stEventGreatEscapeLight()
  {
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventGreatEscapeLight()
  {

    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => $this->getOptions()
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

  public function actPassEventGreatEscapeLight()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actEventGreatEscapeLight($args)
  {
    self::checkAction('actEventGreatEscapeLight');
    $argMoves = $args['moves'];

    $option = $this->getOptions();

    $forces = [];
    $moves = [];

    $robinHood = null;
    $robinHoodFromLocation = false;
    foreach ($argMoves as $toSpaceId => $merryMenIds) {
      $toSpace = Utils::array_find($option['spaces'], function ($space) use ($toSpaceId) {
        return $space->getId() === $toSpaceId;
      });

      if ($toSpace === null) {
        throw new \feException("ERROR 104");
      }

      $merryMen = [];
      foreach ($merryMenIds as $merryManId) {
        if ($merryManId === ROBIN_HOOD && $option['robinHood'] !== null) {
          $robinHood = $option['robinHood'];
          $robinHoodFromLocation = $robinHood->getLocation();
          if ($robinHood->getLocation() === ROBIN_HOOD_SUPPLY) {
            $robinHood->setLocation($toSpaceId);
            $robinHood->setHidden(0);
          } else {
            $merryMen[] = $robinHood;
          }
          // $robinHoodPlaced = true;
          continue;
        }

        $merryMan = Utils::array_find($option['merryMen'], function ($force) use ($merryManId) {
          return $force->getId() === $merryManId;
        });
        if ($merryMan === null) {
          throw new \feException("ERROR 105");
        }
        $merryMen[] = $merryMan;
      }

      $notifData = GameMap::createMoves(array_map(function ($merryMan) use ($toSpaceId) {
        return [
          'force' => $merryMan,
          'toSpaceId' => $toSpaceId,
          'toHidden' => false,
        ];
      }, $merryMen));
      $forces = array_merge($forces, $notifData['forces']);
      $moves = array_merge($moves, $notifData['moves']);
    }

    $requiredCount = count($option['merryMen']);
    if ($option['robinHood'] !== null && !in_array($robinHoodFromLocation, [ROBIN_HOOD_SUPPLY, PRISON])) {
      $requiredCount += 1;
    }

    if (count($forces) !== $requiredCount) {
      Notifications::log('forces', $forces);
      Notifications::log('requiredCount', $requiredCount);
      Notifications::log('robinHoodFromLocation', $robinHoodFromLocation);
      
      throw new \feException("ERROR 106");
    }

    if ($robinHood === null && $option['robinHood'] !== null) {
      throw new \feException("ERROR 107");
    }
    $player = self::getPlayer();
    Notifications::eventGreatEscapeLight(self::getPlayer(), $forces, $moves);

    if ($robinHoodFromLocation === ROBIN_HOOD_SUPPLY && $robinHood !== null) {
      Notifications::placeForce($player, $robinHood, Spaces::get($robinHood->getLocation()));
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
    $merryMenInPrison = Forces::getInLocation(PRISON)->toArray();
    $robinHood = Forces::get(ROBIN_HOOD);


    return [
      'merryMen' => $merryMenInPrison,
      'robinHood' => $robinHood->getLocation() === PRISON ? null : $robinHood,
      'spaces' => Spaces::get(NOTTINGHAM)->getAdjacentSpaces(),
    ];
  }
}
