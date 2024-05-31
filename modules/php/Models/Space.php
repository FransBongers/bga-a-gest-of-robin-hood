<?php

namespace AGestOfRobinHood\Models;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Connections;
use AGestOfRobinHood\Managers\Spaces;
use AGestOfRobinHood\Managers\Units;

/**
 * Space
 */
class Space extends \AGestOfRobinHood\Helpers\DB_Model
{
  protected $id;
  protected $table = 'spaces';
  protected $primary = 'space_id';
  protected $status = null;

  protected $attributes = [
    'id' => ['space_id', 'int'],
    'status' => ['status', 'str'],
    'location' => ['space_location', 'str'],
    'state' => ['space_state', 'int'],
    // 'extraData' => ['extra_data', 'obj'],
  ];


  protected $staticAttributes = [
    'adjacentSpaces',
    'name',
    'setupStatus',
  ];

  protected $adjacentSpaces = [];
  protected $name = '';
  protected $setupStatus = null;
  


  // public function __construct($row)
  // {
  //   if ($row != null) {
  //     parent::__construct($row);
  //   }
  // }

  public function jsonSerialize()
  {
    return [
      'id' => $this->id,
      'setupStatus' => $this->setupStatus,
      'name' => $this->name,
      // 'top' => $this->top,
      // 'left' => $this->left,
    ];
  }

  public function getAdjacentSpaces()
  {
    $result = [];

    return $result;
  }

  public function getAdjacentSpacesIds()
  {
    return array_keys($this->adjacentSpaces);
  }

}
