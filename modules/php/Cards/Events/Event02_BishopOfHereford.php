<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;

class Event02_BishopOfHereford extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event02_BishopOfHereford';
    $this->title = clienttranslate('Bishop of Hereford');
    $this->titleLight = clienttranslate('Easy mark');
    $this->textLight = clienttranslate('Place the Bishop in the Travellers Deck and remove a Knight from the Travellers Deck or Discard from the game (if possible), then shuffle the Travellers Deck.');
    $this->titleDark = clienttranslate('Seeks sanctuary with the Sheriff');
    $this->textDark = clienttranslate('Gain 2 Shillings and remove a Monk from the Travellers Deck or Discard to the Victims Pile.');
    $this->carriageMoves = 2;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }

  public function performLightEffect($player, $successful, $ctx = null, $space = null)
  {
    $card = Cards::get('Traveller11_BishopOfHereford'); 
    $card->setLocation(TRAVELLERS_DECK);

    Notifications::placeCardInTravellersDeck($player, $card);

    $ctx->insertAsBrother(new LeafNode([
      'action' => REMOVE_TRAVELLER,
      'playerId' => $player->getId(),
      'from' => [TRAVELLERS_DECK, TRAVELLERS_DISCARD],
      'to' => [REMOVED_FROM_GAME],
      'cardType' => KNIGHT,
      'shuffle' => [TRAVELLERS_DECK],
    ]));
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $player->incShillings(2);

    $ctx->insertAsBrother(new LeafNode([
      'action' => REMOVE_TRAVELLER,
      'playerId' => $player->getId(),
      'from' => [TRAVELLERS_DECK, TRAVELLERS_DISCARD],
      'to' => [TRAVELLERS_VICTIMS_PILE],
      'cardType' => MONK,
      'shuffle' => [TRAVELLERS_DECK],
    ]));
  }

  public function canPerformLightEffect($player)
  {
    return true;
  }

  public function canPerformDarkEffect($player)
  {
    return true;
  }

}
