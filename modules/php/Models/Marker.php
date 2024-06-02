<?php

namespace AGestOfRobinHood\Models;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;
use AGestOfRobinHood\Managers\Units;

class Marker extends \AGestOfRobinHood\Helpers\DB_Model implements \JsonSerializable
{
  protected $table = 'markers';
  protected $primary = 'marker_id';
  protected $attributes = [
    'id' => ['marker_id', 'str'],
    'location' => ['marker_location', 'str'],
    'state' => ['marker_location', 'int'],
    // 'extraData' => ['extra_data', 'obj'],
  ];

  protected $id = null;
  protected $location = null;
  protected $state = null;

  public function jsonSerialize()
  {
    return [
      'id' => $this->id,
      'location' => $this->location,
      'type' => $this->id,
      'side' => $this->state === 0 ? 'front' : 'back',
    ];
  }

  // ..######...########.########.########.########.########...######.
  // .##....##..##..........##.......##....##.......##.....##.##....##
  // .##........##..........##.......##....##.......##.....##.##......
  // .##...####.######......##.......##....######...########...######.
  // .##....##..##..........##.......##....##.......##...##.........##
  // .##....##..##..........##.......##....##.......##....##..##....##
  // ..######...########....##.......##....########.##.....##..######.


  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...
}
