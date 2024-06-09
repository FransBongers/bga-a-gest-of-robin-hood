<?php

namespace AGestOfRobinHood\Cards\Events;

class Event31_RoyalInspection extends \AGestOfRobinHood\Cards\Events\Event_RoyalInspection
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event31_RoyalInspection';
  }
}
