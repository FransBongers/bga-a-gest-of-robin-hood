<?php

namespace AGestOfRobinHood\Cards\Events;

class Event13_Ambush extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event13_Ambush';
    $this->title = clienttranslate('Ambush');
    $this->titleLight = clienttranslate('Perfect hiding places');
    $this->textLight = clienttranslate('Move any number of Merry Men to a space with a Carriage, flip them Hidden, and attempt a Rob there now.');
    $this->titleDark = clienttranslate('Easy to detect');
    $this->textDark = clienttranslate('Reveal all Merry Men in a Forest and shift one step towards Order.');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
