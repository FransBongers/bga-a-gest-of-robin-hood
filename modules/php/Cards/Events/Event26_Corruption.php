<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event26_Corruption extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event26_Corruption';
    $this->title = clienttranslate('Corruption');
    $this->titleLight = clienttranslate('Sheriff\'s authority crumbles');
    $this->textLight = clienttranslate('Pay 1 Shilling to replace 1 Henchman with a Merry Man.');
    $this->titleDark = clienttranslate('Hungry Merry Men defect');
    $this->textDark = clienttranslate('Pay 2 Shillings to replace up to 2 Merry Men in one space with 1 Henchmen each.');
    $this->carriageMoves = 2;
    $this->eventType = REGULAR_EVENT;
  }
}
