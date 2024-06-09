<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Managers\Players;

class Event16_HeavyRain extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event16_HeavyRain';
    $this->title = clienttranslate('Heavy Rain');
    $this->titleLight = clienttranslate('Storms slow action');
    $this->textLight = clienttranslate('Both players, in eligibility order, may either perform a Single Plot or gain 2 Shillings.');
    $this->carriageMoves = 0;
    $this->eventType = FORTUNE_EVENT;
    $this->setupLocation = FORTUNE_EVENTS_POOL;
  }

  public function getFlow()
  {
    $order = Players::getEligibilityOrder();

    return [
      'children' => [
        [
          'action' => SELECT_PLOT,
          'playerId' => $order[0],
          'source' => $this->id, 
        ],
        [
          'action' => SELECT_PLOT,
          'playerId' => $order[1],
          'source' => $this->id,
        ],
      ]
    ];
  }
}
