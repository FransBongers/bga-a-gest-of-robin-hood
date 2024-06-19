<?php

namespace AGestOfRobinHood\Cards\Travellers;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;

class Traveller12_GuyOfGisborne extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller12_GuyOfGisborne';
    $this->title = clienttranslate('Guy of Gisborne');
    $this->titleLight = clienttranslate('Fight!');
    $this->textLight = clienttranslate('If successful, remove the card from the game. If failed, place all Robbing Merry Men in Prison (+1 Order if Robin Hood is among them) and discard the card.');
    $this->strength = 3;
    $this->setupLocation = TRAVELLERS_POOL;
  }

  public function performLightEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = null)
  {
    if ($successful) {
      $this->removeFromGame($player);
    } else {
      Notifications::log('merryMenIds', $merryMenIds);
      $merryMen = Forces::getMany($merryMenIds)->toArray();
      $notifInput = GameMap::createMoves(array_map(function ($merryMan) {
        return [
          'force' => $merryMan,
          'toSpaceId' => PRISON,
          'toHidden' => false,
        ];
      }, $merryMen));
      Notifications::robCaptureRobbingMerryMen($player, $notifInput['forces'], $notifInput['moves']);
      if (in_array(ROBIN_HOOD, $merryMenIds)) {
        Players::moveRoyalFavour($player, 1, ORDER);
      }
    }
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = null)
  {

  }

  public function canPerformDarkEffect($player)
  {
    return false;
  }
}
