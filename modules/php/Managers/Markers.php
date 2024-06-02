<?php

namespace AGestOfRobinHood\Managers;

use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Managers\Scenarios;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Models\Marker;

/**
 * extends
 */
class Markers extends \AGestOfRobinHood\Helpers\Pieces
{
  protected static $table = 'markers';
  protected static $prefix = 'marker_';
  protected static $customFields = [
    // 'extra_data'
  ];
  protected static $autoremovePrefix = false;
  protected static $autoreshuffle = false;
  protected static $autoIncrement = false;

  protected static function cast($marker)
  {
    // return [
    //   'id' => $token['marker_id'],
    //   'location' => $token['marker_location'],
    //   'state' => intval($token['marker_state']),
    // ];
    return new Marker($marker);
  }


  //////////////////////////////////
  //////////////////////////////////
  //////////// GETTERS //////////////
  //////////////////////////////////
  //////////////////////////////////

  // public static function getOfTypeInLocation($type, $location)
  // {
  //   return self::getSelectQuery()
  //     ->where(static::$prefix . 'id', 'LIKE', $type . '%')
  //     ->where(static::$prefix . 'location', 'LIKE', $location . '%')
  //     ->get()
  //     ->toArray();
  // }

  // public static function getUiData()
  // {
  //   return self::getPool()
  //     ->merge(self::getInLocationOrdered('inPlay'))
  //     ->merge(self::getInLocation('base_%'))
  //     ->merge(self::getInLocation('projects_%'))
  //     ->ui();
  // }

  // public static function getStaticData()
  // {
  //   $cards = Cards::getAll();
  //   $staticData = [];
  //   foreach($cards as $cardId => $card) {
  //     if ($card->getType() !== TABLEAU_CARD) {
  //       continue;
  //     }
  //     $staticData[explode('_',$card->getId())[0]] = $card->getStaticData();
  //   }
  //   return $staticData;
  // }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......


  public static function setupNewGame($players = null, $options = null)
  {
    $markers = [];

    $markers[ROYAL_FAVOUR_MARKER] = [
      'id' => ROYAL_FAVOUR_MARKER,
      'location' => Locations::orderTrack(1),
    ];
    $markers[ROYAL_INSPECTION_MARKER] = [
      'id' => ROYAL_INSPECTION_MARKER,
      'location' => Locations::royalInspectionTrack(BALAD),
    ];
    $markers[ROBIN_HOOD_ELIGIBILITY_MARKER] = [
      'id' => ROBIN_HOOD_ELIGIBILITY_MARKER,
      'location' => Locations::initiativeTrack(FIRST_ELIGIBLE),
    ];
    $markers[SHERIFF_ELIGIBILITY_MARKER] = [
      'id' => SHERIFF_ELIGIBILITY_MARKER,
      'location' => Locations::initiativeTrack(SECOND_ELIGIBLE),
    ];

    self::create($markers, null);
  }
}
