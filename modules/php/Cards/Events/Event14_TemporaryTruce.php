<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event14_TemporaryTruce extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event14_TemporaryTruce';
    $this->title = clienttranslate('Temporary Truce');
    $this->titleLight = clienttranslate('Opportunity to escape');
    $this->textLight = clienttranslate('The Sheriff may move all Henchmen to Submissive spaces to shift one step towards Order, then Robin Hood may move all Merry Men to Camps or Forests (and hide them) to shift one step towards Justice.');
    $this->carriageMoves = 0;
    $this->eventType = FORTUNE_EVENT;
  }
}
