<?php

namespace AGestOfRobinHood\Managers;

use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Models\Force;
use AGestOfRobinHood\Helpers\Utils;

/**
 * Units
 */
class Forces extends \AGestOfRobinHood\Helpers\Pieces
{
  protected static $table = 'forces';
  protected static $prefix = 'force_';
  protected static $customFields = [
    'type',
    'hidden',
    'extra_data',
  ];
  protected static $autoremovePrefix = false;
  protected static $autoreshuffle = false;
  protected static $autoIncrement = false;

  protected static function cast($row)
  {
    // Notifications::log('cast',$row);
    return self::getInstance($row['force_id'], $row);
  }

  public static function getInstance($id, $row = null)
  {
    // $prefix = self::getClassPrefix($counterId);

    $type = $row['type'];

    $className = "\AGestOfRobinHood\Forces\\$type";
    return new $className($row);
  }

  // ..######...########.########.########.########.########...######.
  // .##....##..##..........##.......##....##.......##.....##.##....##
  // .##........##..........##.......##....##.......##.....##.##......
  // .##...####.######......##.......##....######...########...######.
  // .##....##..##..........##.......##....##.......##...##.........##
  // .##....##..##..........##.......##....##.......##....##..##....##
  // ..######...########....##.......##....########.##.....##..######.

  /**
   * getStaticUiData : return all units static datas
   */
  public static function getStaticUiData()
  {
    // $units = self::getAll()->toArray();

    // $data = [];
    // foreach ($units as $index => $unit) {
    //   $counterId = $unit->getCounterId();
    //   $className = '\BayonetsAndTomahawks\Units\\' . $counterId;
    //   $unit = new $className(null);
    //   $data[$unit->getCounterId()] = $unit->getStaticUiData();
    // }
    // return $data;
  }

  private static function getDefaultPublic()
  {
    return [
      CAMP => [
        HIDDEN => 0,
        REVEALED => 0,
      ],
      CARRIAGE => [
        HIDDEN => 0,
        TALLAGE_CARRIAGE => 0,
        TRIBUTE_CARRIAGE => 0,
        TRAP_CARRIAGE => 0,
      ],
      MERRY_MEN => [
        HIDDEN => 0,
        REVEALED => 0,
      ],
      HENCHMEN => [],
      ROBIN_HOOD => 0,
    ];
  }

  public static function getUiData()
  {

    $spaces = Spaces::getAll();

    $publicData = [];
    $publicData[USED_CARRIAGES] = self::getDefaultPublic();
    $publicData[PRISON] = self::getDefaultPublic();
    $robinHoodForces = [];
    $sheriffForces = [];

    foreach ($spaces as $spaceId => $space) {
      $publicData[$spaceId] = self::getDefaultPublic();
      $robinHoodForces[$spaceId] = [];
      $sheriffForces[$spaceId] = [];
      // $robinHoodData[$spaceId] = [
      //   MERRY_MEN => [],
      //   CAMP => [],
      //   ROBIN_HOOD => [],
      // ];
      // $sheriffData[$spaceId] = [
      //   CARRIAGE => []
      // ];
    }

    $forces = self::getAll()->toArray();

    $locationsOnMap = array_merge(SPACES, [USED_CARRIAGES, PRISON]);

    foreach ($forces as $index => $force) {
      $location = $force->getLocation();
      if (!in_array($location, $locationsOnMap)) {
        continue;
      }
      $type = $force->getType();
      $isHidden = $force->isHidden();

      if ($type === HENCHMEN) {
        $publicData[$location][HENCHMEN][] = $force;
      } else if ($type === MERRY_MEN) {
        $publicData[$location][MERRY_MEN][$isHidden ? HIDDEN : REVEALED] += 1;
        $robinHoodForces[$location][] = $force;
      } else if ($type === CAMP) {
        $publicData[$location][CAMP][$isHidden ? HIDDEN : REVEALED] += 1;
        $robinHoodForces[$location][] = $force;
      } else if ($type === ROBIN_HOOD) {
        $robinHoodForces[$location][] = $force;
        if ($isHidden) {
          $publicData[$location][MERRY_MEN][HIDDEN] += 1;
        } else {
          $publicData[$location][ROBIN_HOOD] = 1;
        }
      } else if (in_array($type, [TALLAGE_CARRIAGE, TRIBUTE_CARRIAGE, TRAP_CARRIAGE])) {
        $sheriffForces[$location][] = $force;
        if ($isHidden) {
          $publicData[$location][CARRIAGE][HIDDEN] += 1;
        } else {
          $publicData[$location][CARRIAGE][$type] += 1;
        }
      }
    }

    $publicData['supply'] = [
      CAMP => count(Utils::filter($forces, function ($force) {
        return $force->getLocation() === CAMPS_SUPPLY;
      })),
      CARRIAGE => count(Utils::filter($forces, function ($force) {
        return $force->getLocation() === CARRIAGE_SUPPLY;
      })),
      HENCHMEN => count(Utils::filter($forces, function ($force) {
        return $force->getLocation() === HENCHMEN_SUPPLY;
      })),
      MERRY_MEN => count(Utils::filter($forces, function ($force) {
        return $force->getLocation() === MERRY_MEN_SUPPLY || $force->getLocation() === ROBIN_HOOD_SUPPLY;
      })),
    ];

    $robinHoodForces['supply'] = [
      CAMP => count(Utils::filter($forces, function ($force) {
        return $force->getLocation() === CAMPS_SUPPLY;
      })),
      MERRY_MEN => count(Utils::filter($forces, function ($force) {
        return $force->getLocation() === MERRY_MEN_SUPPLY;
      })),
      ROBIN_HOOD => count(Utils::filter($forces, function ($force) {
        return $force->getLocation() === ROBIN_HOOD_SUPPLY;
      })),
    ];

    $sheriffForces['supply'] = [
      HENCHMEN => count(Utils::filter($forces, function ($force) {
        return $force->getLocation() === HENCHMEN_SUPPLY;
      })),
      TALLAGE_CARRIAGE => count(Utils::filter($forces, function ($force) {
        return $force->getLocation() === CARRIAGE_SUPPLY && $force->getType() === TALLAGE_CARRIAGE;
      })),
      TRAP_CARRIAGE => count(Utils::filter($forces, function ($force) {
        return $force->getLocation() === CARRIAGE_SUPPLY && $force->getType() === TRAP_CARRIAGE;
      })),
      TRIBUTE_CARRIAGE => count(Utils::filter($forces, function ($force) {
        return $force->getLocation() === CARRIAGE_SUPPLY && $force->getType() === TRIBUTE_CARRIAGE;
      })),
    ];


    return [
      'public' => $publicData,
      ROBIN_HOOD => $robinHoodForces,
      SHERIFF => $sheriffForces,
    ];
  }


  public static function getOfType($type)
  {
    return self::getSelectQuery()
      ->where('type', 'LIKE', $type . '%')
      ->get()
      ->toArray();
  }

  public static function getOfTypeInLocation($type, $location)
  {
    return self::getSelectQuery()
      ->where('type', 'LIKE', $type . '%')
      ->where(static::$prefix . 'location', 'LIKE', $location . '%')
      ->get()
      ->toArray();
  }

  // ..######..########.########.########.########.########...######.
  // .##....##.##..........##.......##....##.......##.....##.##....##
  // .##.......##..........##.......##....##.......##.....##.##......
  // ..######..######......##.......##....######...########...######.
  // .......##.##..........##.......##....##.......##...##.........##
  // .##....##.##..........##.......##....##.......##....##..##....##
  // ..######..########....##.......##....########.##.....##..######.

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  public static function createForces()
  {
    // Only needed if we enable rematches?
    self::DB()
      ->delete()
      ->run();

    $unitIdIndex = 1;

    $forces = [];

    $forces[] = [
      "id" => "camp_{INDEX}",
      "nbr" => 5,
      "nbrStart" => 1,
      "location" => CAMPS_SUPPLY,
      "type" => CAMP,
      "hidden" => 1
    ];

    $forces[] = [
      "id" => "merryMen_{INDEX}",
      "nbr" => 10,
      "nbrStart" => 1,
      "location" => MERRY_MEN_SUPPLY,
      "type" => MERRY_MEN,
      "hidden" => 1
    ];

    $forces[] = [
      "id" => "henchmen_{INDEX}",
      "nbr" => 18,
      "nbrStart" => 1,
      "location" => HENCHMEN_SUPPLY,
      "type" => HENCHMEN
    ];

    $forces[] = [
      "id" => ROBIN_HOOD,
      "location" => ROBIN_HOOD_SUPPLY,
      "type" => ROBIN_HOOD,
      "hidden" => 1
    ];

    $forces[] = [
      "id" => "carriage_{INDEX}",
      "nbr" => 2,
      "nbrStart" => 1,
      "location" => CARRIAGE_SUPPLY,
      "type" => TALLAGE_CARRIAGE,
      "hidden" => 1,
    ];

    $forces[] = [
      "id" => "carriage_{INDEX}",
      "nbr" => 2,
      "nbrStart" => 3,
      "location" => CARRIAGE_SUPPLY,
      "type" => TRIBUTE_CARRIAGE,
      "hidden" => 1,
    ];

    $forces[] = [
      "id" => "carriage_{INDEX}",
      "nbr" => 2,
      "nbrStart" => 5,
      "location" => CARRIAGE_SUPPLY,
      "type" => TRAP_CARRIAGE,
      "hidden" => 1,
    ];

    self::create($forces, null);

    self::shuffle(MERRY_MEN_SUPPLY);
    self::shuffle(HENCHMEN_SUPPLY);
    self::shuffle(CAMPS_SUPPLY);
  }

  public static function placeStartingForces()
  {
    self::pickForLocation(2, HENCHMEN_SUPPLY, NOTTINGHAM);
    self::pickForLocation(1, HENCHMEN_SUPPLY, BLYTH);
    self::pickForLocation(1, HENCHMEN_SUPPLY, MANSFIELD);
    self::pickForLocation(1, HENCHMEN_SUPPLY, BINGHAM);
    self::pickForLocation(1, CAMPS_SUPPLY, SHIRE_WOOD);
    $camp = self::getTopOf(SHIRE_WOOD);
    $camp->setHidden(0);

    // Test setup
    // self::move(self::get(ROBIN_HOOD)->getId(), REMSTON);
    // self::pickForLocation(1, MERRY_MEN_SUPPLY, REMSTON);
    // self::pickForLocation(2, MERRY_MEN_SUPPLY, SHIRE_WOOD);
    // self::pickForLocation(1, MERRY_MEN_SUPPLY, SOUTHWELL_FOREST);
    // self::pickForLocation(1, CARRIAGE_SUPPLY, BINGHAM);
    // self::pickForLocation(1, CARRIAGE_SUPPLY, RETFORD);
    // self::pickForLocation(1, HENCHMEN_SUPPLY, RETFORD);
  }

  public static function setupNewGame($players = null, $options = null)
  {
    self::createForces();
    self::placeStartingForces();
  }

  // public function remove($unitId)
  // {
  //   $unitId = is_int($unitId) ? $unitId : $unitId->getId();
  //   self::DB()->delete($unitId);
  // }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

}
