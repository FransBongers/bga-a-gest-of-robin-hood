<?php

namespace AGestOfRobinHood\Models;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\TableauOps;

class Force extends \AGestOfRobinHood\Helpers\DB_Model
{
  protected $id;
  protected $table = 'forces';
  protected $primary = 'force_id';
  protected $location;
  protected $state;
  protected $hidden = 0;
  protected $type = null;

  protected $attributes = [
    'id' => ['force_id', 'str'],
    'location' => 'force_location',
    'state' => ['force_state', 'int'],
    'hidden' => ['hidden', 'int'],
    'type' => ['type', 'str'],
    // 'extraData' => ['extra_data', 'obj'],
  ];

  protected $staticAttributes = [
    // 'type'
  ];

  public function jsonSerialize()
  {
    $data = parent::jsonSerialize();

    return array_merge($data, []);
  }

  public function getUiData()
  {
    // Notifications::log('getUiData card model', []);
    return $this->jsonSerialize(); // Static datas are already in js file
  }

  public function isHidden()
  {
    return $this->getHidden() === 1;
  }
}