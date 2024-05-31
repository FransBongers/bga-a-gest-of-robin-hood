<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event30_RoyalInspection extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event30_RoyalInspection';
    $this->title = clienttranslate('Royal Inspection');
    $this->textLight = clienttranslate('Immediately conduct a Royal Inspection Round, then continue play.');
    $this->carriageMoves = 1;
    $this->eventType = ROYAL_INSPECTION;
  }
}
