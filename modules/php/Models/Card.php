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

class Card extends \AGestOfRobinHood\Helpers\DB_Model
{
  protected $id;
  protected $table = 'cards';
  protected $primary = 'card_id';
  protected $location;
  protected $state;


  protected $attributes = [
    'id' => ['card_id', 'str'],
    'location' => 'card_location',
    'state' => ['card_state', 'int'],
    'extraData' => ['extra_data', 'obj'],

  ];

  protected $staticAttributes = [
    'id',
  ];

  public function jsonSerialize()
  {
    $data = parent::jsonSerialize();

    return array_merge($data, [

    ]);
  }

  public function getUiData()
  {
    // Notifications::log('getUiData card model', []);
    return $this->jsonSerialize(); // Static datas are already in js file
  }

  public function insertAtBottom($location)
  {
    Cards::insertAtBottom($this->getId(), $location);
    $this->location = $location;
  }

  public function insertOnTop($location)
  {
    Cards::insertOnTop($this->getId(), $location);
    $this->location = $location;
  }

}