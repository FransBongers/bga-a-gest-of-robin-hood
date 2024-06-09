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
use AGestOfRobinHood\Managers\Spaces;

class Force extends \AGestOfRobinHood\Helpers\DB_Model
{
  protected $id;
  protected $table = 'forces';
  protected $primary = 'force_id';
  protected $location;
  protected $state;
  protected $hidden = 0;
  protected $type = null;
  protected $publicType = null;

  protected $attributes = [
    'id' => ['force_id', 'str'],
    'location' => 'force_location',
    'state' => ['force_state', 'int'],
    'hidden' => ['hidden', 'int'],
    'type' => ['type', 'str'],
    // 'extraData' => ['extra_data', 'obj'],
  ];

  protected $name = '';
  protected $publicName = '';
  protected $supply = null;

  protected $staticAttributes = [
    'name',
    'publicName',
    'publicType',
    'supply',
  ];

  public function jsonSerialize()
  {
    $data = parent::jsonSerialize();

    return array_merge($data, [
      'hidden' => $this->isHidden()
    ]);
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

  public function isCamp()
  {
    return $this->type === CAMP;
  }

  public function isCarriage()
  {
    return in_array($this->type, CARRIAGE_TYPES);
  }

  public function isMerryMan()
  {
    return $this->type === MERRY_MEN || $this->type === ROBIN_HOOD;
  }

  public function isMerryManNotRobinHood()
  {
    return $this->type === MERRY_MEN;
  }

  public function isHenchman()
  {
    return $this->type === HENCHMEN;
  }

  public function isRobinHood()
  {
    return $this->type === ROBIN_HOOD;
  }

  public function reveal($player = null)
  {
    $player = $player === null ? Players::get() : $player;

    $this->setHidden(0);
    Notifications::revealForce($player, $this);
  }

  public function hide($player = null, $notify = true)
  {
    $player = $player === null ? Players::get() : $player;
    $this->setHidden(1);
    Notifications::hideForce($player, $this);
  }

  public function getCarriageGainsSheriff()
  {
    return [
      'shillings' => 0,
      'royalFavour' => 0,
    ];
  }

  public function getSpace()
  {
    if (in_array($this->getLocation(), SPACES)) {
      return Spaces::get($this->getLocation());
    } else {
      return null;
    }
  }

  public function returnToSupply($player)
  {
    $fromPrison = $this->location === PRISON;
    $space = $fromPrison ? null : Spaces::get($this->getLocation());
    $this->setLocation($this->supply);
    $isHidden = $this->isHidden();
    if ($this->type !== HENCHMEN) {
      $this->setHidden(1);
    }
    Notifications::returnToSupply($player, $this, $space, $isHidden, $fromPrison);
    if ($this->type === CAMP) {
      Players::moveRoyalFavour($player, 1, ORDER);
    }
  }
}
