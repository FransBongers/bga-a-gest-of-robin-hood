<?php

namespace AGestOfRobinHood\Cards\Travellers;

class Traveller07_Monks extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller07_Monks';
    $this->title = clienttranslate('Monks');
    $this->titleLight = clienttranslate('Forced charity');
    $this->textLight = clienttranslate('If successful, gain 1 Shilling and put the card in the discard pile. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('Brutal punishment!');
    $this->textDark = clienttranslate('If successful, gain 3 Shillings and put the card in the Victims Pile. If failed, set the space to Submissive (if possible) and put the card in the discard pile.');
    $this->strength = 0;
    $this->setupLocation = TRAVELLERS_DECK;
  }
}
