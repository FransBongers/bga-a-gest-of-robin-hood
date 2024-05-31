<?php

namespace AGestOfRobinHood\Managers;

use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Helpers\Utils;

/**
 * Cards
 */
class Spaces extends \AGestOfRobinHood\Helpers\Pieces
{
  protected static $table = 'spaces';
  protected static $prefix = 'space_';
  protected static $customFields = [
    'status',
    // 'extra_data'
  ];
  protected static $autoremovePrefix = false;
  protected static $autoreshuffle = false;
  protected static $autoIncrement = false;

  protected static function cast($row)
  {
    return self::getInstance($row['space_id'], $row);
  }

  public static function getInstance($id, $data = null)
  {
    $className = "\AGestOfRobinHood\Spaces\\" . $id;
    return new $className($data);
  }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  /* Creation of the cards */
  public static function setupNewGame($players = null, $options = null)
  {
    $spaces = [];
    foreach (SPACES as $spaceId) {
      $space = self::getInstance($spaceId);

      $data = [
        'id' => $spaceId,
        'location' => 'default',
        'status' => $space->getSetupStatus(),
        // 'extra_data' => ['properties' => []],
      ];

      $spaces[$spaceId] = $data;
    }
    self::create($spaces, null);
  }

  public static function getUiData()
  {
    return self::getAll()->map(function ($space) {
      return $space->jsonSerialize();
    })->toArray();
  }
}
