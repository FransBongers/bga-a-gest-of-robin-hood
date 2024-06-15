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

  public static function carriagesAreOnTheMap()
  {
    $forces = Forces::getAll()->toArray();

    return Utils::array_some($forces, function ($force) {
      return $force->isCarriage() && in_array($force->getLocation(), SPACES);
    });
  }

  public static function merryManAreOnTheMap($hidden = false)
  {
    $merryMen = Forces::getOfType(MERRY_MEN);
    $merryMen[] = Forces::get(ROBIN_HOOD);

    return Utils::array_some($merryMen, function ($merryMan) use ($hidden) {
      $location = $merryMan->getLocation();
      if (!in_array($location, SPACES)) {
        return false;
      }
      if ($hidden && !$merryMan->isHidden()) {
        return false;
      }
      return true;
    });
  }

  public static function getSpacesWithMerryMen($hidden = false)
  {
    $merryMen = Forces::getOfType(MERRY_MEN);
    $merryMen[] = Forces::get(ROBIN_HOOD);

    $spaces = Spaces::getAll();

    $result = [];

    foreach ($spaces as $spaceId => $space) {
      $merryMenInSpace = Utils::filter($merryMen, function ($force) use ($spaceId, $hidden) {
        if ($force->getLocation() !== $spaceId) {
          return false;
        };
        if ($hidden && !$force->isHidden()) {
          return false;
        }
        return true;
      });
      if (count($merryMenInSpace) > 0) {
        $result[$spaceId] = [
          'space' => $space,
          'merryMen' => $merryMenInSpace
        ];
      }
    }

    return $result;
  }

  public static function placeMerryMan($player, $space, $placeRobinHood)
  {
    $merryMenToPlace = [];
    $robinHood = null;
    $originalNumber = 1;
    $numberToPlace = $originalNumber;
    $spaceId = $space->getId();

    if ($placeRobinHood) {
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

  public static function placeCamp($player, $space)
  {
    $camp = Forces::getTopOf(CAMPS_SUPPLY);
    if ($camp === null) {
      return;
    }
    $camp->setLocation($space->getId());
    if ($space->isForest()) {
      $camp->setHidden(0);
    }
    Notifications::placeForce($player, $camp, $space);
    Players::moveRoyalFavour($player, 1, JUSTICE);
  }

  private static function getPublicMoveType($type, $hidden)
  {
    if ($type === ROBIN_HOOD && $hidden) {
      return MERRY_MEN;
    } else if (in_array($type, CARRIAGE_TYPES)) {
      return CARRIAGE;
    } else {
      return $type;
    }
  }

  /**
   * Creates data that can be used by notifs
   * Input should be an array with
   * [
   *   'force' => $force,
   *   'toSpaceId' => $spaceId,
   *   'toHidden' => true,
   * ]
   */
  public static function createMoves($input)
  {
    $forces = [];
    $moves = [];

    foreach ($input as $move) {
      $force = $move['force'];
      $toSpaceId = $move['toSpaceId'];
      $toHidden = $move['toHidden'];
      $currentLocation = $force->getLocation();
      $fromHidden = $force->isHidden();

      $force->setLocation($toSpaceId);
      $force->setHidden($toHidden ? 1 : 0);

      $moves[] = [
        'from' => [
          'type' => self::getPublicMoveType($force->getType(), $fromHidden),
          'hidden' => $fromHidden,
          'spaceId' => $currentLocation,
        ],
        'to' => [
          'type' => self::getPublicMoveType($force->getType(), $toHidden),
          'hidden' => $toHidden,
          'spaceId' => $toSpaceId,
        ]
      ];
      $forces[] = $force;
    }
    return [
      'forces' => $forces,
      'moves' => $moves,
    ];
  }
}
