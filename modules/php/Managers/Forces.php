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

    // $className = "\AGestOfRobinHood\Forces\\$prefix\\$counterId";
    return new Force($row);
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
    $robinHoodData = [];

    foreach ($spaces as $spaceId => $space) {
      $publicData[$spaceId] = [
        CAMP => [
          HIDDEN => 0,
          REVEALED => 0,
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
    }

    $forces = self::getAll();

    foreach ($forces as $forceId => $force) {
      $location = $force->getLocation();
      if (!in_array($location, SPACES)) {
        continue;
      }
      $type = $force->getType();
      $isHidden = $force->isHidden();
      Notifications::log('force type', $type);
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
      }
    }

    return [
      'public' => $publicData,
      'robinHood' => $robinHoodData,
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

  // ..######..########.########.########.########.########...######.
  // .##....##.##..........##.......##....##.......##.....##.##....##
  // .##.......##..........##.......##....##.......##.....##.##......
  // ..######..######......##.......##....######...########...######.
  // .......##.##..........##.......##....##.......##...##.........##
  // .##....##.##..........##.......##....##.......##....##..##....##
  // ..######..########....##.......##....########.##.....##..######.

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
