<?php

namespace AGestOfRobinHood\Helpers;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;

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

  public static function getSpacesWithMerryMen($hidden = false)
  {
    $merryMen = Forces::getOfType(MERRY_MEN);
    $merryMen[] = Forces::get(ROBIN_HOOD);

    $spaceIds = [];

    foreach ($merryMen as $merryMan) {
      $location = $merryMan->getLocation();
      if (!in_array($location, SPACES)) {
        continue;
      }
      if ($hidden && !($merryMan->isHidden() || $merryMan->getId() === ROBIN_HOOD)) {
        continue;
      }
      $spaceIds[] = $location;
    }

    $spaceIds = array_values(array_unique($spaceIds));

    return Spaces::get($spaceIds)->toArray();
  }
}
