<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event28_NottinghamFair extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event28_NottinghamFair';
    $this->title = clienttranslate('Nottingham Fair');
    $this->titleLight = clienttranslate('Little John befriends the Sheriff\'s cook');
    $this->textLight = clienttranslate('Replace up to 2 Henchmen in Nottingham with Merry Men.');
    $this->titleDark = clienttranslate('Too much stout ale');
    $this->textDark = clienttranslate('Remove up to 2 Merry Men from spaces adjacent to Nottingham to Available.');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
  }
}
