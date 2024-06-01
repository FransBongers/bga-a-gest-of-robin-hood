<?php

namespace AGestOfRobinHood\Cards\Events;

class Event25_WeaponsOfTheWeak extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event25_WeaponsOfTheWeak';
    $this->title = clienttranslate('Weapons of the Weak');
    $this->titleLight = clienttranslate('Passive resistance');
    $this->textLight = clienttranslate('Remove one Submissive marker from the game. That Parish is now neither Submissive nor Revolting, but still counts as Submissive for Rob and Capture Plots.');
    $this->titleDark = clienttranslate('Peasants resigned to oppression');
    $this->textDark = clienttranslate('Set one Revolting Parish to Submissive.');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }
}
