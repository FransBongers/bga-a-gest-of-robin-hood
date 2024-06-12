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


class PlaceHenchmen extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_PLACE_HENCHMEN;
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

  public function stPlaceHenchmen()
  {

    $count = Forces::getInLocation(HENCHMEN_SUPPLY);

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

  public function argsPlaceHenchmen()
  {
    return $this->getOptions();
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

  public function actPassPlaceHenchmen()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actPlaceHenchmen($args)
  {
    self::checkAction('actPlaceHenchmen');
    $spaceId = $args['spaceId'];
    $count = $args['count'];

    $options = $this->getOptions();

    if (!isset($options['spaces'][$spaceId])) {
      throw new \feException("ERROR 064");
    }
    $space = $options['spaces'][$spaceId];

    if ($count > $options['maxNumber'] || $count > count($options['henchmen'])) {
      throw new \feException("ERROR 065");
    }

    $forces = [];
    for ($i = 0; $i < $count; $i++) {
      $henchman = $options['henchmen'][$i];
      $henchman->setLocation($spaceId);
      $forces[] = $henchman;
    }

    Notifications::placeHenchmen(self::getPlayer(), $forces, $space);

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
    $info = $this->ctx->getInfo();
    $maxNumber = $info['maxNumber'];
    $locationIds = $info['locationIds'];

    $spaces = Spaces::get($locationIds);

    $henchmen = Forces::getTopOf(HENCHMEN_SUPPLY, 2, false)->toArray();
    return [
      'spaces' => $spaces,
      'henchmen' => $henchmen,
      'maxNumber' => min(count($henchmen), $maxNumber),
    ];
  }
}
