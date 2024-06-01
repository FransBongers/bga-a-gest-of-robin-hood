<?php

namespace AGestOfRobinHood\Cards\Events;

class Event22_FastCarriages extends \AGestOfRobinHood\Models\EventCard
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
    $this->eventType = REGULAR_EVENT;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
