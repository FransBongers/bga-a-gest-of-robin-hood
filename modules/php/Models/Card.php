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

  protected $eventType = null;
  protected $title = '';
  protected $titleLight = '';
  protected $textLight = '';
  protected $clarificationLight = [];
  protected $titleDark = '';
  protected $textDark = '';
  protected $clarificationDark = [];
  protected $type = null;
  protected $carriageMoves = 0;
  protected $strength = 0;
  protected $setupLocation = null;

  protected $attributes = [
    'id' => ['card_id', 'str'],
    'location' => 'card_location',
    'state' => ['card_state', 'int'],
    // 'extraData' => ['extra_data', 'obj'],
  ];

  protected $staticAttributes = [
    'id',
    'carriageMoves',
    'clarificationDark',
    'clarificationLight',
    'eventType',
    'setupLocation',
    'strength',
    'title',
    'titleLight',
    'textLight',
    'titleDark',
    'textDark',
    'type',
  ];

  public function jsonSerialize()
  {
    $data = parent::jsonSerialize();

    return array_merge($data, [
      'eventType' => $this->eventType,
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

  public function removeFromGame($player)
  {
    $fromLocation = $this->getLocation();
    $this->setLocation(REMOVED_FROM_GAME);
    Notifications::removeCardFromGame($player, $this, $fromLocation);
  }

  public function removeToVictimsPile($player)
  {
    $fromLocation = $this->getLocation();
    $this->setLocation(TRAVELLERS_VICTIMS_PILE);
    Notifications::putCardInVictimsPile($player, $this, $fromLocation);
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
  }

  public function performLightEffect($player, $successful, $ctx = null, $space = null)
  {
  }

  public function canPerformDarkEffect($player)
  {
    return true;
  }

  public function canPerformLightEffect($player)
  {
    return true;
  }

  public function requiresRoll($darkOrLight)
  {
    return true;
  }

  public function isFortuneEvent()
  {
    return $this->eventType === FORTUNE_EVENT;
  }

  public function isRoyalInspection()
  {
    return $this->eventType === ROYAL_INSPECTION;
  }

  public function getFlow()
  {
    return [
      'children' => []
    ];
  }
}
