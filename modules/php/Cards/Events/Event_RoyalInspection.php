<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;

class Event_RoyalInspection extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->title = clienttranslate('Royal Inspection');
    $this->textLight = clienttranslate('Immediately conduct a Royal Inspection Round, then continue play.');
    $this->carriageMoves = 1;
    $this->eventType = ROYAL_INSPECTION;
    $this->setupLocation = ROYAL_INSPECTIONS_POOL;
  }

  public function getFlow()
  {
    return [
      'children' => [
        [
          'action' => ROYAL_INSPECTION_UNREST,
          'playerId' => Players::getRobinHoodPlayerId(),
        ],
        [
          'action' => ROYAL_INSPECTION_MISCHIEF,
          'playerId' => Players::getRobinHoodPlayerId(),
        ],
      ]
    ];
  }
}
