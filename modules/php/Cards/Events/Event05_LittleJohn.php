<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event05_LittleJohn extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event05_LittleJohn';
    $this->title = clienttranslate('Little John');
    $this->titleLight = clienttranslate('Loyal companion');
    $this->textLight = clienttranslate('Reveal Robin Hood to place a Hidden Merry Man in his space and gain 2 Shillings.');
    $this->titleDark = clienttranslate('Foolish bumbler');
    $this->textDark = clienttranslate('Set a Revolting Parish with a Revealed Merry Man to Submissive.');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
  }
}
