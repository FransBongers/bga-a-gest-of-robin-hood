<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Helpers\GameMap;

class Event22_FastCarriages extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event22_FastCarriages';
    $this->title = clienttranslate('Fast Carriages');
    $this->titleLight = clienttranslate('Vulnerable to attack');
    $this->textLight = clienttranslate('Perform a free Single Sneak, then Rob in up to three spaces, adding 1 to the result of each Rob roll.');
    $this->titleDark = clienttranslate('Rapid transportation');
    $this->textDark = clienttranslate('Immediately move one Carriage up to 2 spaces.');
    $this->carriageMoves = 1;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    // $this->setLocation(TRAVELLERS_DECK);

    // Notifications::placeCardInTravellersDeck($player, $this);

    $ctx->insertAsBrother(new LeafNode([
      'action' => MOVE_CARRIAGE,
      'playerId' => $player->getId(),
      'numberOfSpaces' => 2,
    ]));
  }

  public function performLightEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(Engine::buildTree([
      'children' => [
        [
          'action' => SNEAK,
          'playerId' => $player->getId(),
          'cost' => 0,
          'optional' => true,
        ],
        [
          'action' => ROB,
          'playerId' => $player->getId(),
          'source' => $this->id,
          'optional' => true,
        ]
      ]
    ]));
  }

  public function canPerformDarkEffect($player)
  {
    return GameMap::carriagesAreOnTheMap();
  }

  public function canPerformLightEffect($player)
  {
    return GameMap::merryManAreOnTheMap();
  }
}
