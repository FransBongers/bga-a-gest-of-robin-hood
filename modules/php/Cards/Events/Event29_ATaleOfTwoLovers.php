<?php

namespace AGestOfRobinHood\Cards\Events;

class Event29_ATaleOfTwoLovers extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event29_ATaleOfTwoLovers';
    $this->title = clienttranslate('A Tale of Two Lovers');
    $this->titleLight = clienttranslate('Allan-a-Dale marries Ellen');
    $this->textLight = clienttranslate('Pay 1 Shilling and, in a single space, remove one Merry Man and up to 2 Henchmen from the game, then shift one step towards Justice.');
    $this->titleDark = clienttranslate('Edward of Deirwold supports the Sheriff');
    $this->textDark = clienttranslate('Gain 2 Shillings and place up to 2 Henchmen in any one Parish.');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
