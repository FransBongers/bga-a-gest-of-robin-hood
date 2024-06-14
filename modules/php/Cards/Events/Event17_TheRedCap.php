<?php

namespace AGestOfRobinHood\Cards\Events;

class Event17_TheRedCap extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event17_TheRedCap';
    $this->title = clienttranslate('The Red Cap');
    $this->titleLight = clienttranslate('Robin wins archery contest');
    $this->textLight = clienttranslate('Reveal Robin Hood to set one adjacent Parish to Revolting, then shift one step towards Justice.');
    $this->titleDark = clienttranslate('Chief archer leads henchmen');
    $this->textDark = clienttranslate('Reveal Robin Hood and move up to two Henchmen to his space from any other space.');
    $this->carriageMoves = 1;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
