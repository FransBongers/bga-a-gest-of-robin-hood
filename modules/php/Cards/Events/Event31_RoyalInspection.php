<?php

namespace AGestOfRobinHood\Cards\Events;

class Event31_RoyalInspection extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event31_RoyalInspection';
    $this->title = clienttranslate('Royal Inspection');
    $this->textLight = clienttranslate('Immediately conduct a Royal Inspection Round, then continue play.');
    $this->carriageMoves = 1;
    $this->eventType = ROYAL_INSPECTION;
    $this->setupLocation = ROYAL_INSPECTIONS_POOL;
  }
}
