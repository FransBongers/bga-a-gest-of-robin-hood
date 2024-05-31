<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event02_BishopOfHereford extends \AGestOfRobinHood\Models\EventCard
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
    $this->eventType = REGULAR_EVENT;
  }
}
