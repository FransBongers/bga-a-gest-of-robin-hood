<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class PlaceMerryManInSpace extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_PLACE_MERRY_MAN_IN_SPACE;
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

  public function stPlaceMerryManInSpace()
  {

    $count = count(Forces::getInLocation(MERRY_MEN_SUPPLY)->toArray()) + count(Forces::getInLocation(ROBIN_HOOD_SUPPLY)->toArray());

    if ($count === 0) {
      $this->resolveAction(['automatic' => true]);
    }
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsPlaceMerryManInSpace()
  {
    $player = self::getPlayer();

    $data = [
      '_private' => [
        $player->getId() => $this->getOptions()
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

  public function actPassPlaceMerryManInSpace()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actPlaceMerryManInSpace($args)
  {
    self::checkAction('actPlaceMerryManInSpace');

    $spaceId = $args['spaceId'];
    $placeRobinHood = $args['placeRobinHood'];

    $options = $this->getOptions();

    if (!isset($options['spaces'][$spaceId])) {
      throw new \feException("ERROR 032");
    }

    // TODO: remove: only here to fix stuck game
    if (!$options['robinHoodInSupply'] && !$options['merryMenInSupply']) {
      $this->resolveAction($args);
      return;
    }

    if ($placeRobinHood && !$options['robinHoodInSupply']) {
      throw new \feException("ERROR 033");
    }

    if (!$placeRobinHood && !$options['merryMenInSupply']) {
      throw new \feException("ERROR 034");
    }

    $space = $options['spaces'][$spaceId];

    $this->placeMerryMan(self::getPlayer(), $space, $placeRobinHood);

    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private function placeMerryMan($player, $space, $recruitRobinHood)
  {
    $merryMenToPlace = [];
    $robinHood = null;
    $originalNumber = 1;
    $numberToPlace = $originalNumber;
    $spaceId = $space->getId();

    if ($recruitRobinHood) {
      $robinHood = Forces::get(ROBIN_HOOD);
      $robinHood->setLocation($spaceId);
      $numberToPlace--;
    }

    for ($i = 0; $i < $numberToPlace; $i++) {
      $merryMan = Forces::getTopOf(MERRY_MEN_SUPPLY);
      $merryMan->setLocation($spaceId);
      $merryMenToPlace[] = $merryMan;
    }

    Notifications::recruitMerryMen($player, $originalNumber, $robinHood, $merryMenToPlace, $space);
  }

  private function getOptions()
  {
    $spaceIds = $this->ctx->getInfo()['spaceIds'];

    $forcesInSupply = Forces::getInLocation(MERRY_MEN_SUPPLY)->toArray();

    return [
      'spaces' => Spaces::getMany($spaceIds),
      'robinHoodInSupply' => Forces::get(ROBIN_HOOD)->getLocation() === ROBIN_HOOD_SUPPLY,
      'merryMenInSupply' => Utils::array_some($forcesInSupply, function ($force) {
        return $force->isMerryMan() && !$force->isRobinHood();
      }),
    ];
  }
}
