<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event19_RoyalPardon extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event19_RoyalPardon';
    $this->title = clienttranslate('Royal Pardon');
    $this->titleLight = clienttranslate('Empty promise');
    $this->textLight = clienttranslate('Place half Merry Men from Prison (rounded down) in a space adjacent to Nottingham, Revealed.');
    $this->titleDark = clienttranslate('A chance for peace');
    $this->textDark = clienttranslate('Release any number of Merry Men from Prison to Available, then shift one step towards Order for every 2 released in this way.');
    $this->carriageMoves = 2;
    $this->eventType = REGULAR_EVENT;
  }
}
