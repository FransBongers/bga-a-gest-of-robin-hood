<?php

namespace AGestOfRobinHood\Cards\Events;

class Event03_QueenEleanor extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event03_QueenEleanor';
    $this->title = clienttranslate('Queen Eleanor');
    $this->titleLight = clienttranslate('Morality questioned');
    $this->textLight = clienttranslate('The Sheriff may remove a Noble Knight from the Traveller deck to the Victims Pile. Shift one step towards Order if there are now four or more cards in the Victims Pile, otherwise shift one step towards Justice.');
    $this->carriageMoves = 0;
    $this->eventType = FORTUNE_EVENT;
    $this->setupLocation = FORTUNE_EVENTS_POOL;
  }
}