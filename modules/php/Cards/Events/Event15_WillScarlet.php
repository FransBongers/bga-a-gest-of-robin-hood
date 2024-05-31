<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event15_WillScarlet extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event15_WillScarlet';
    $this->title = clienttranslate('Will Scarlet');
    $this->titleLight = clienttranslate('Talented woodsman');
    $this->textLight = clienttranslate('Place a Camp in one Forest (and shift one step towards Justice), even if there is already a Camp there.');
    $this->titleDark = clienttranslate('Robin\'s resentful kinsman');
    $this->textDark = clienttranslate('Reveal Robin Hood and perform a free Single Patrol.');
    $this->carriageMoves = 2;
    $this->eventType = REGULAR_EVENT;
  }
}
