<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event07_YeomenRevolt extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event07_YeomenRevolt';
    $this->title = clienttranslate('Yeomen Revolt');
    $this->titleLight = clienttranslate('Revolt encouraged');
    $this->textLight = clienttranslate('Set a Parish without Henchmen to Revolting and shift one step towards Justice.');
    $this->titleDark = clienttranslate('Revolt suppressed');
    $this->textDark = clienttranslate('If there are more Submissive Parishes than Revolting Parishes, shift one step towards Order.');
    $this->carriageMoves = 2;
    $this->eventType = REGULAR_EVENT;
  }
}
