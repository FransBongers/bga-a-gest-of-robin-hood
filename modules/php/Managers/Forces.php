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

  public static function getUiData()
  {

    $spaces = Spaces::getAll();

    $publicData = [];
    $publicData[USED_CARRIAGES] = [
      CARRIAGE => [
        HIDDEN => 0,
        TALLAGE_CARRIAGE => 0,
        TRIBUTE_CARRIAGE => 0,
        TRAP_CARRIAGE => 0,
      ]
    ];
    $robinHoodData = [];
    $sheriffData = [];

    foreach ($spaces as $spaceId => $space) {
      $publicData[$spaceId] = [
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
      $robinHoodData[$spaceId] = [
        MERRY_MEN => [],
        CAMP => [],
        ROBIN_HOOD => [],
      ];
      $sheriffData[$spaceId] = [
        CARRIAGE => []
      ];
    }

    $forces = self::getAll();

    $locationsOnMap = array_merge(SPACES, [USED_CARRIAGES, PRISION]);

    foreach ($forces as $forceId => $force) {
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
        $robinHoodData[$location][MERRY_MEN][] = $force;
      } else if ($type === CAMP) {
        $publicData[$location][CAMP][$isHidden ? HIDDEN : REVEALED] += 1;
        $robinHoodData[$location][CAMP][] = $force;
      } else if ($type === ROBIN_HOOD) {
        $robinHoodData[$location][ROBIN_HOOD][] = $force;
        if ($isHidden) {
          $publicData[$location][MERRY_MEN][HIDDEN] += 1;
        } else {
          $publicData[$location][ROBIN_HOOD] = 1;
        }
      } else if (in_array($type, [TALLAGE_CARRIAGE, TRIBUTE_CARRIAGE, TRAP_CARRIAGE])) {
        $sheriffData[$location][CARRIAGE][] = $force;
        if ($isHidden) {
          $publicData[$location][CARRIAGE][HIDDEN] += 1;
        } else {
          $publicData[$location][CARRIAGE][$type] += 1;
        }
      }
    }

    return [
      'public' => $publicData,
      ROBIN_HOOD => $robinHoodData,
      SHERIFF => $sheriffData,
    ];
  }



  // public static function get($id, $raiseExceptionIfNotEnough = true)
  // {
  //   $result = self::getMany($id, $raiseExceptionIfNotEnough);
  //   return $result->count() == 1 ? $result->first() : $result;
  // }

  // public static function getMany($ids, $raiseExceptionIfNotEnough = true)
  // {
  //   if (!is_array($ids)) {
  //     $ids = [$ids];
  //   }

  //   $ids = array_map(function ($id) {
  //     if (Utils::startsWith($id, 'unit')) {
  //       return intval(explode('_', $id)[1]);
  //     } else {
  //       return $id;
  //     }
  //   }, $ids);

  //   return parent::getMany($ids, $raiseExceptionIfNotEnough);
  // }
  public static function getOfType($type)
  {
    return self::getSelectQuery()
      ->where('type', 'LIKE', $type . '%')
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
      "nbr" => 18,
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
      "location" => MERRY_MEN_SUPPLY,
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
    // self::pickForLocation(1, MERRY_MEN_SUPPLY, SHIRE_WOOD);
    // self::pickForLocation(1, MERRY_MEN_SUPPLY, SOUTHWELL_FOREST);
    self::pickForLocation(1, CARRIAGE_SUPPLY, BINGHAM);
    self::pickForLocation(1, CARRIAGE_SUPPLY, RETFORD);
    self::pickForLocation(1, HENCHMEN_SUPPLY, RETFORD);
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
