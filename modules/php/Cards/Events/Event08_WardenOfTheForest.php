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
      'children' => [],
    ];

    $hire = AtomicActions::get(HIRE);
    $sheriff = Players::getSheriffPlayer();
    $sheriffId = $sheriff->getId();
    if ($sheriff->getShillings() >= 2 && count($hire->getOptions($this->id)) > 0) {
      $nodes['children'][] = [
        'action' => HIRE,
        'playerId' => $sheriffId,
        'optional' => true,
        'source' => $this->id,
      ];
    } else {
      $nodes['children'][] = [
        'action' => MESSAGE,
        'playerId' => $sheriffId,
        'source' => $this->id,
        'messageType' => MESSAGE_CANNOT_PERFORM_EVENT,
      ];
    }

    $donate = AtomicActions::get(DONATE);
    $robinHood = Players::getRobinHoodPlayer();
    $robinHoodId = $robinHood->getId();
    if ($donate->canBePerformed($robinHood, $robinHood->getShillings())) {
      $nodes['children'][] = [
        'action' => DONATE,
        'playerId' => $robinHoodId,
        'optional' => true,
        'source' => $this->id,
      ];
    } else {
      $nodes['children'][] = [
        'action' => MESSAGE,
        'playerId' => $robinHoodId,
        'source' => $this->id,
        'messageType' => MESSAGE_CANNOT_PERFORM_EVENT,
      ];
    }

    $resultPlayerId = $sheriff->getId();
    if (count($nodes['children']) === 1) {
      $resultPlayerId = $nodes['children'][0]['playerId'] === $sheriffId ? $robinHoodId : $sheriffId;
    }

    $nodes['children'][] = [
      'action' => FORTUNE_EVENT_WARDEN_OF_THE_FOREST_RESULT,
      'playerId' => $resultPlayerId,
      'source' => $this->id,
    ];

    return $nodes;
  }
}
