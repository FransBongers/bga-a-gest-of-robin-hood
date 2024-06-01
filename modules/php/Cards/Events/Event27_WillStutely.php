<?php

namespace AGestOfRobinHood\Cards\Events;

class Event27_WillStutely extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event27_WillStutely';
    $this->title = clienttranslate('Will Stutely');
    $this->titleLight = clienttranslate('A cunning ruse');
    $this->textLight = clienttranslate('Move a Hidden Merry Man to a Parish from an adjacent space, then move all Henchmen there to Nottingham.');
    $this->titleDark = clienttranslate('To the gallows!');
    $this->textDark = clienttranslate('Place any two Revealed Merry Men in Prison (not Robin Hood).');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
