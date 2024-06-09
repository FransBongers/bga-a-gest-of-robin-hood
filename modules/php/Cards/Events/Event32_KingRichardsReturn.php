<?php

namespace AGestOfRobinHood\Cards\Events;

class Event32_KingRichardsReturn extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event32_KingRichardsReturn';
    $this->title = clienttranslate('King Richard\'s Return');
    $this->textLight = clienttranslate('Immediately conduct the Unrest Phase of a Royal Inspection Round, then determine victory.');
    $this->setupLocation = EVENTS_DECK;
  }
}
