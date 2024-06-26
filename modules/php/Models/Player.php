<?php

namespace AGestOfRobinHood\Models;

use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Preferences;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\PlayersExtra;

/*
 * Player: all utility functions concerning a player
 */

class Player extends \AGestOfRobinHood\Helpers\DB_Model
{
  protected $table = 'player';
  protected $primary = 'player_id';
  protected $attributes = [
    'id' => ['player_id', 'int'],
    'no' => ['player_no', 'int'],
    'avatar' => 'player_avatar',
    'name' => 'player_name',
    'color' => 'player_color',
    'eliminated' => 'player_eliminated',
    'score' => ['player_score', 'int'],
    'scoreAux' => ['player_score_aux', 'int'],
    'zombie' => 'player_zombie',
  ];

  /*
   * Getters
   */
  public function getPref($prefId)
  {
    return Preferences::get($this->id, $prefId);
  }

  public function jsonSerialize($currentPlayerId = null)
  {
    $data = parent::jsonSerialize();
    $isCurrentPlayer = intval($currentPlayerId) == $this->getId();

    return array_merge(
      $data,
      [
        'shillings' => $this->getShillings(),
        'side' => $this->getSide(),
      ],
    );
  }

  public function getId()
  {
    return (int) parent::getId();
  }

  public function isRobinHood()
  {
    return $this->getSide() === ROBIN_HOOD;
  }

  public function getShillings()
  {
    return intval(PlayersExtra::get($this->getId())['shillings']);
  }

  public function getSide()
  {
    return COLOR_SIDE_MAP[$this->getColor()];
  }

  public function isSheriff()
  {
    return $this->getSide() === SHERIFF;
  }

  public function getEligibilityMarker()
  {
    if ($this->getSide() === ROBIN_HOOD) {
      return Markers::get(ROBIN_HOOD_ELIGIBILITY_MARKER);
    } else {
      return Markers::get(SHERIFF_ELIGIBILITY_MARKER);
    }
  }

  public function incShillings($amount, $sendNotif = true)
  {
    Players::incShillings($this->getId(), $amount);
    if ($sendNotif) {
      Notifications::gainShillings($this, $amount);
    }
  }

  public function payShillings($amount, $sendNotif = true)
  {
    Players::incShillings($this->getId(), -$amount);
    if ($sendNotif) {
      Notifications::payShillings($this, $amount);
    }
  }
}
