<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;

class Event14_TemporaryTruce extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event14_TemporaryTruce';
    $this->title = clienttranslate('Temporary Truce');
    $this->titleLight = clienttranslate('Opportunity to escape');
    $this->textLight = clienttranslate('The Sheriff may move all Henchmen to Submissive spaces to shift one step towards Order, then Robin Hood may move all Merry Men to Camps or Forests (and hide them) to shift one step towards Justice.');
    $this->carriageMoves = 0;
    $this->eventType = FORTUNE_EVENT;
    $this->setupLocation = FORTUNE_EVENTS_POOL;
  }

  public function getFlow()
  {
    $nodes = [
      'children' => [
        [
          'action' => ROYAL_INSPECTION_REDEPLOYMENT_SHERIFF,
          'playerId' => Players::getSheriffPlayerId(),
          'source' => $this->id,
          'optional' => true,
        ],
        [
          'action' => ROYAL_INSPECTION_REDEPLOYMENT_ROBIN_HOOD,
          'playerId' => Players::getRobinHoodPlayerId(),
          'source' => $this->id,
          'optional' => true,
        ],
      ],
    ];

    return $nodes;
  }


}
