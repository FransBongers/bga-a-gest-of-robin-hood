<?php

namespace AGestOfRobinHood\Cards\Events;

class Event21_RobinsHorn extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event21_RobinsHorn';
    $this->title = clienttranslate('Robin\'s Horn');
    $this->titleLight = clienttranslate('An epic robbery');
    $this->textLight = clienttranslate('Reveal Robin Hood to move up to 3 Merry Men from adjacent spaces into his space, Hidden. Then, may attempt a Rob there.');
    $this->titleDark = clienttranslate('A common thief');
    $this->textDark = clienttranslate('Place Henchmen up to half the number of cards in the Victims Pile (rounded up) in any Parishes, then may Capture in one Parish where a Henchman was placed.');
    $this->carriageMoves = 2;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
