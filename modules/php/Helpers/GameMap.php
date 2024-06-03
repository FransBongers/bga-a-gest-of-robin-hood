<?php

namespace AGestOfRobinHood\Helpers;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;

class GameMap extends \APP_DbObject
{

  public static function getCarriagesOnMap()
  {
    $carriageIds = [];
    for ($i = 1; $i <= 6; $i++) {
      $carriageIds[] = 'carriage_' . $i;
    }
    $carriages = Forces::get($carriageIds)->toArray();
    return Utils::filter($carriages, function ($carriage) {
      return in_array($carriage->getLocation(), SPACES);
    });
  }

  /**
   * Returns true if there are carriages on the map to move
   */
  public static function getNumberOfCarriages()
  {
    return count(self::getCarriagesOnMap());
  }
}
