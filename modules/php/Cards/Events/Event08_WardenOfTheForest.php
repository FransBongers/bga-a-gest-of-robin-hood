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

class Event08_WardenOfTheForest extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event08_WardenOfTheForest';
    $this->title = clienttranslate('Warden of the Forest');
    $this->titleLight = clienttranslate('Surprise inspection');
    $this->textLight = clienttranslate('The Sheriff may Hire in up to two Revolting Parishes, then Robin Hood may Donate once. Shift one step towards Order if there are now five or more Submissive Parishes, otherwise shift one step towards Justice.');
    $this->carriageMoves = 0;
    $this->eventType = FORTUNE_EVENT;
    $this->setupLocation = FORTUNE_EVENTS_POOL;
  }

  public function getFlow()
  {
    $nodes = [
      'children' => [
      ],
    ];

    $hire = AtomicActions::get(HIRE);
    $sheriff = Players::getSheriffPlayer();

    if ($hire->canBePerformed($sheriff, $sheriff->getShillings())) {
      $nodes['children'][] = [
        'action' => HIRE,
        'playerId' => $sheriff->getId(),
        'optional' => true,
        'source' => $this->id,
      ];
    }

    $donate = AtomicActions::get(DONATE);
    $robinHood = Players::getRobinHoodPlayer();

    if ($donate->canBePerformed($robinHood, $robinHood->getShillings())) {
      $nodes['children'][] = [
        'action' => DONATE,
        'playerId' => $robinHood->getId(),
        'optional' => true,
        'source' => $this->id,
      ];
    }

    return $nodes;
  }
}
