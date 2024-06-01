<?php

namespace AGestOfRobinHood\Cards\Events;

class Event11_GreatEscape extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event11_GreatEscape';
    $this->title = clienttranslate('Great Escape');
    $this->titleLight = clienttranslate('Daring rescue');
    $this->textLight = clienttranslate('Place Robin Hood and all Merry Men from Prison adjacent to Nottingham, Revealed.');
    $this->titleDark = clienttranslate('A traitor in the ranks');
    $this->textDark = clienttranslate('Reveal all Merry Men in one space, then Capture there.');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
