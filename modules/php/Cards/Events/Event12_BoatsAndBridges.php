<?php

namespace AGestOfRobinHood\Cards\EventCard;

class Event12_BoatsAndBridges extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event12_BoatsAndBridges';
    $this->title = clienttranslate('Boats & Bridges');
    $this->titleLight = clienttranslate('Crafting boats');
    $this->textLight = clienttranslate('Move any number of Merry Men from one space adjacent to a River to one other space adjacent to a River, then hide all moved Merry Men.');
    $this->titleDark = clienttranslate('Building bridges');
    $this->textDark = clienttranslate('Place the Bridge across any River border, which is now treated as a regular border. Shift one step towards Order.');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
  }
}
