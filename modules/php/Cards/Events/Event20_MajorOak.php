<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event20_MajorOak extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event20_MajorOak';
    $this->title = clienttranslate('Major Oak');
    $this->titleLight = clienttranslate('Sanctuary');
    $this->textLight = clienttranslate('Place a Camp on Ollerton Hill (shift one step towards Justice). For Robin Hood, all spaces adjacent to Ollerton Hill are now adjacent to each other (keep this card as a reminder).');
    $this->titleDark = clienttranslate('Camp destroyed');
    $this->textDark = clienttranslate('Remove a Camp from a Forest space (shift one step towards Order).');
    $this->carriageMoves = 2;
    $this->eventType = REGULAR_EVENT;
  }
}
