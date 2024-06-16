<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;

class RegularEvent extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->eventType = REGULAR_EVENT;
  }

  // ..######..##.....##..#######...#######...######..########
  // .##....##.##.....##.##.....##.##.....##.##....##.##......
  // .##.......##.....##.##.....##.##.....##.##.......##......
  // .##.......#########.##.....##.##.....##..######..######..
  // .##.......##.....##.##.....##.##.....##.......##.##......
  // .##....##.##.....##.##.....##.##.....##.##....##.##......
  // ..######..##.....##..#######...#######...######..########

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  public function performLightEffect($player, $successful, $ctx = null, $space = null)
  {
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
  }

  public function canPerformLightEffect($player)
  {
    return true;
  }

  public function canPerformDarkEffect($player)
  {
    return true;
  }

  // .########..########..######...#######..##.......##.....##.########
  // .##.....##.##.......##....##.##.....##.##.......##.....##.##......
  // .##.....##.##.......##.......##.....##.##.......##.....##.##......
  // .########..######....######..##.....##.##.......##.....##.######..
  // .##...##...##.............##.##.....##.##........##...##..##......
  // .##....##..##.......##....##.##.....##.##.........##.##...##......
  // .##.....##.########..######...#######..########....###....########

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  public function resolveDarkEffectAutomatically($player, $ctx)
  {
    return false;
  }

  public function resolveLightEffectAutomatically($player, $ctx)
  {
    return false;
  }

  public function resolveLightEffect($player, $ctx, $args)
  {
  }

  public function resolveDarkEffect($player, $ctx, $args)
  {
  }

  public function resolveLightPass($player, $ctx)
  {
  }

  public function resolveDarkPass($player, $ctx)
  {
  }

  public function getLightStateArgs()
  {
    return [];
  }

  public function getDarkStateArgs()
  {
    return [];
  }
}
