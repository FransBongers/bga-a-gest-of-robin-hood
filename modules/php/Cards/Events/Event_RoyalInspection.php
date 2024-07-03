<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Locations;
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
    $robinHoodPlayerId = Players::getRobinHoodPlayerId();
    $sheriffPlayerId = Players::getSheriffPlayerId();

    return [
      'children' => [
        [
          'action' => ROYAL_INSPECTION_UNREST,
          'playerId' => $robinHoodPlayerId,
          'isKingRichardsReturn' => $this->id === 'Event32_KingRichardsReturn',
        ],
        [
          'action' => ROYAL_INSPECTION_MOVE_MARKER,
          'playerId' => $robinHoodPlayerId,
          'location' => Locations::royalInspectionTrack(MISCHIEF),
        ],
        [
          'action' => ROYAL_INSPECTION_MISCHIEF,
          'playerId' => $robinHoodPlayerId,
        ],
        [
          'action' => ROYAL_INSPECTION_MOVE_MARKER,
          'playerId' => $sheriffPlayerId,
          'location' => Locations::royalInspectionTrack(GOVERNANCE),
        ],
        [
          'action' => ROYAL_INSPECTION_GOVERNANCE,
          'playerId' => $sheriffPlayerId,
        ],
        [
          'action' => ROYAL_INSPECTION_MOVE_MARKER,
          'playerId' => $sheriffPlayerId,
          'location' => Locations::royalInspectionTrack(REDEPLOYMENT),
        ],
        [
          'action' => ROYAL_INSPECTION_REDEPLOYMENT_SHERIFF,
          'playerId' => $sheriffPlayerId,
        ],
        [
          'action' => ROYAL_INSPECTION_HIDE_ALL_MERRY_MEN,
          'playerId' => $robinHoodPlayerId,
        ],
        [
          'action' => ROYAL_INSPECTION_REDEPLOYMENT_ROBIN_HOOD,
          'playerId' => $robinHoodPlayerId,
        ],
        [
          'action' => ROYAL_INSPECTION_PLACE_ROBIN_HOOD,
          'playerId' => $robinHoodPlayerId,
        ],
        [
          'action' => ROYAL_INSPECTION_SWAP_ROBIN_HOOD,
          'playerId' => $robinHoodPlayerId,
          'optional' => true,
        ],
        [
          'action' => ROYAL_INSPECTION_MOVE_MARKER,
          'playerId' => $sheriffPlayerId,
          'location' => Locations::royalInspectionTrack(RESET),
        ],
        [
          'action' => ROYAL_INSPECTION_RESET,
          'playerId' => $sheriffPlayerId,
        ],
        [
          'action' => ROYAL_INSPECTION_MOVE_MARKER,
          'playerId' => $sheriffPlayerId,
          'location' => Locations::royalInspectionTrack(BALAD),
        ],
      ]
    ];
  }
}
