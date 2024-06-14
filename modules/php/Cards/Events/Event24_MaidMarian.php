<?php

namespace AGestOfRobinHood\Cards\Events;

class Event24_MaidMarian extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event24_MaidMarian';
    $this->title = clienttranslate('Maid Marian');
    $this->titleLight = clienttranslate('Distributed leadership');
    $this->textLight = clienttranslate('Perform a free Single Plot and then Swashbuckle or Inspire with any Merry Man.');
    $this->titleDark = clienttranslate('Sheriff persuaded to show mercy');
    $this->textDark = clienttranslate('Remove a Carriage from the map to the Used Carriages box to set any one Parish to Submissive. Move all Merry Men in that Parish to an adjacent space.');
    $this->carriageMoves = 1;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
