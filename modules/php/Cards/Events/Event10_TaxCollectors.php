<?php

namespace AGestOfRobinHood\Cards\Events;

class Event10_TaxCollectors extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event10_TaxCollectors';
    $this->title = clienttranslate('Tax Collectors');
    $this->titleLight = clienttranslate('Incompetent administrators');
    $this->textLight = clienttranslate('Move up to 4 Merry Men from adjacent spaces into Nottingham, flip them Hidden, then may attempt a Rob there.');
    $this->titleDark = clienttranslate('Brutal enforcement');
    $this->textDark = clienttranslate('Confiscate in up to two Parishes, even if Revolting.');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
