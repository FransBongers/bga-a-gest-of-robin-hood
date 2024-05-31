<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event23_FriarTuck extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event23_FriarTuck';
    $this->title = clienttranslate('Friar Tuck');
    $this->titleLight = clienttranslate('Popular preacher');
    $this->textLight = clienttranslate('Donate in up to three Parishes where a Merry Man is present, even if there are more Henchmen, paying only 1 Shilling per Parish.');
    $this->titleDark = clienttranslate('Issues with alcohol');
    $this->textDark = clienttranslate('Reveal all Merry Men in one space where a Henchman is present.');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
  }
}
