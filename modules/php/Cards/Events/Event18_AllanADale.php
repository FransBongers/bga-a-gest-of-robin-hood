<?php

namespace AGestOfRobinHood\Cards\Events;

class Event18_AllanADale extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event18_AllanADale';
    $this->title = clienttranslate('Allan-a-dale');
    $this->titleLight = clienttranslate('Flamboyant troubadour');
    $this->textLight = clienttranslate('Reveal any number of Merry Men in one space, gaining one Shilling for each revealed in this way. Shift one step towards Justice.');
    $this->titleDark = clienttranslate('Noisy troublemaker');
    $this->textDark = clienttranslate('Perform a free Single Patrol, automatically Revealing all Merry Men in destination space if at least one Henchman is there.');
    $this->carriageMoves = 2;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
