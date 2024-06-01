<?php

namespace AGestOfRobinHood\Cards\Events;

class Event08_WardenOfTheForest extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event08_WardenOfTheForest';
    $this->title = clienttranslate('Warden of the Forest');
    $this->titleLight = clienttranslate('Surprise inspection');
    $this->textLight = clienttranslate('The Sheriff may Hire in up to two Revolting Parishes, then Robin Hood may Donate once. Shift one step towards Order if there are now five or more Submissive Parishes, otherwise shift one step towards Justice.');
    $this->carriageMoves = 0;
    $this->eventType = FORTUNE_EVENT;
    $this->setupLocation = FORTUNE_EVENTS_POOL;
  }
}
