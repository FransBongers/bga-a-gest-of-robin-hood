<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;

class Event04_GuyOfGisborne extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event04_GuyOfGisborne';
    $this->title = clienttranslate('Guy of Gisborne');
    $this->titleLight = clienttranslate('Fooled by decoy');
    $this->textLight = clienttranslate('You may swap Robin Hood, even if he is in Prison or in Available, with any other Merry Man on the board. Hide Robin Hood and Reveal the Merry Man.');
    $this->titleDark = clienttranslate('Ruthless second-in-command');
    $this->textDark = clienttranslate('Place Guy in the Travellers Deck and remove a Monk from the Travellers Deck or Discard from the game (if possible), then shuffle the Travellers Deck.');
    $this->carriageMoves = 1;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }

  public function performLightEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_GUY_OF_GISBORNE,
      'playerId' => $player->getId(),
      'optional' => true,
    ]));
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $card = Cards::get('Traveller12_GuyOfGisborne');
    $card->setLocation(TRAVELLERS_DECK);

    Notifications::placeCardInTravellersDeck($player, $card);

    $ctx->insertAsBrother(new LeafNode([
      'action' => REMOVE_TRAVELLER,
      'playerId' => $player->getId(),
      'from' => [TRAVELLERS_DECK, TRAVELLERS_DISCARD],
      'to' => [REMOVED_FROM_GAME],
      'cardType' => MONK,
      'shuffle' => [TRAVELLERS_DECK],
    ]));
  }

  public function canPerformLightEffect($player)
  {
    return Utils::array_some(Forces::getOfType(MERRY_MEN), function ($merryMan) {
      return in_array($merryMan->getLocation(), SPACES);
    });
  }

  public function canPerformDarkEffect($player)
  {
    return true;
  }
}
