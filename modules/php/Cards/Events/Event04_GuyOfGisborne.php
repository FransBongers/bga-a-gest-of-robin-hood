<?php

namespace AGestOfRobinHood\Cards\Events;

class Event04_GuyOfGisborne extends \AGestOfRobinHood\Models\EventCard
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
    $this->eventType = REGULAR_EVENT;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
