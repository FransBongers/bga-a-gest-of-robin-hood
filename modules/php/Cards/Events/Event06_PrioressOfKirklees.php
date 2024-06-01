<?php

namespace AGestOfRobinHood\Cards\Events;

class Event06_PrioressOfKirklees extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event06_PrioressOfKirklees';
    $this->title = clienttranslate('Prioress of Kirklees');
    $this->titleLight = clienttranslate('Robin\'s cousin provides shelter');
    $this->textLight = clienttranslate('Flip all Merry Men in one Parish to Hidden and shift one step towards Justice.');
    $this->titleDark = clienttranslate('Weakens Robin with poison');
    $this->textDark = clienttranslate('Remove Robin Hood and any one Merry Man in the same space to Available.');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
