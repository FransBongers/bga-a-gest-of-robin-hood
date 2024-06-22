<?php

namespace AGestOfRobinHood\Models;

use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Connections;
use AGestOfRobinHood\Managers\Forces;
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
    'adjacentSpaceIds',
    'adjacentViaOllertonHillSpaceIds',
    'name',
    'road',
    'setupStatus',
  ];

  protected $adjacentSpaceIds = [];
  protected $adjacentViaOllertonHillSpaceIds = [];
  protected $name = '';
  protected $setupStatus = null;
  protected $road = null;



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
      'status' => $this->getStatus(),
      'name' => $this->name,
      // 'top' => $this->top,
      // 'left' => $this->left,
    ];
  }

  public function getAdjacentSpacesIds()
  {
    $adjacentSpaceIds = $this->adjacentSpaceIds;
    if (Globals::getOllertonHillAdjacency()) {
      $adjacentSpaceIds = array_merge($adjacentSpaceIds, $this->adjacentViaOllertonHillSpaceIds);
    }
    $bridgeLocation = Globals::getBridgeLocation();
    if (isset(RIVER_BORDERS[$bridgeLocation]) && in_array($this->id, RIVER_BORDERS[$bridgeLocation])) {
      $otherSpace = Utils::filter(RIVER_BORDERS[$bridgeLocation], function ($borderId) {
        return $borderId !== $this->id;
      });
      $adjacentSpaceIds = array_merge($adjacentSpaceIds, $otherSpace);
    }

    return $adjacentSpaceIds;
  }

  public function getAdjacentSpaces()
  {
    return Spaces::getMany($this->getAdjacentSpacesIds())->toArray();
  }

  public function getSingleForce($type)
  {
    $forces = $this->getForces($type);
    $count = count($forces);
    if ($count === 0) {
      return null;
    }
    return $forces[$count - 1];
  }

  public function getForces($type = null)
  {
    $forces = Forces::getInLocationOrdered($this->id)->toArray();
    if ($type === null) {
      return $forces;
    }
    return Utils::filter($forces, function ($force) use ($type) {
      return $force->getType() === $type;
    });
  }

  public function getNextSpaceAlongRoad()
  {
    if ($this->road === null) {
      return null;
    }
    return Spaces::get($this->road);
  }

  public function removeSubmissiveMarker($player)
  {
    $this->setStatus(PASSIVE);
    Notifications::removeSubmissiveMarker($player, $this);
  }

  public function revolt($player)
  {
    $this->setStatus(REVOLTING);
    Notifications::parishStatus($player, $this, REVOLTING);
  }

  public function setToSubmissive($player)
  {
    $this->setStatus(SUBMISSIVE);
    Notifications::parishStatus($player, $this, SUBMISSIVE);
  }

  public function isParish()
  {
    return in_array($this->id, PARISHES);
  }

  public function isRevolting()
  {
    return $this->status === REVOLTING;
  }

  public function isSubmissive()
  {
    return $this->status === SUBMISSIVE;
  }

  public function isForest()
  {
    return in_array($this->id, [SHIRE_WOOD, SOUTHWELL_FOREST]);
  }
}
