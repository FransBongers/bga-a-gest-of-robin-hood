<?php

namespace AGestOfRobinHood\Models;

class TravellerCard extends Card
{
  protected $type = TRAVELLER_CARD;
  protected $travellerOrder = 0;

  public function jsonSerialize()
  {
    $data = parent::jsonSerialize();
    unset($data['state']);
    $data['travellerOrder'] = $this->travellerOrder;
    return $data;
  }
}