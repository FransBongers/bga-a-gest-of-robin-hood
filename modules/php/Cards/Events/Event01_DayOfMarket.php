<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Managers\Players;

class Event01_DayOfMarket extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event01_DayOfMarket';
    $this->title = clienttranslate('Day of Market');
    $this->titleLight = clienttranslate('Time to make a profit');
    $this->textLight = clienttranslate('The Sheriff may return any number of Henchmen to Available to gain one Shilling per Henchmen returned, up to the number of Submissive Parishes. Then, Robin Hood may return one Merry Man to Available to gain half that number of Shillings (rounded down).');
    $this->carriageMoves = 2;
    $this->eventType = FORTUNE_EVENT;
    $this->setupLocation = FORTUNE_EVENTS_POOL;
  }

  public function getFlow()
  {
    return [
      'children' => [
        [
          'action' => FORTUNE_EVENT_DAY_OF_MARKET_SHERIFF,
          'playerId' => Players::getSheriffPlayerId(),
          'optional' => true,
        ],
        [
          'action' => FORTUNE_EVENT_DAY_OF_MARKET_ROBIN_HOOD,
          'playerId' => Players::getRobinHoodPlayerId(),
          'optional' => true,
        ],
      ]
    ];
  }
}
