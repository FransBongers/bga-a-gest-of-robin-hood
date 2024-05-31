<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event09_SocialBandit extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event09_SocialBandit';
    $this->title = clienttranslate('Social Bandit');
    $this->titleLight = clienttranslate('People\'s hero');
    $this->textLight = clienttranslate('Reveal Robin Hood in a Parish to place a Camp there and gain 2 Shillings.');
    $this->titleDark = clienttranslate('Out of touch outlaw');
    $this->textDark = clienttranslate('Reveal Robin Hood and set the space he is in to Submissive (if possible).');
    $this->carriageMoves = 2;
    $this->eventType = REGULAR_EVENT;
  }
}
