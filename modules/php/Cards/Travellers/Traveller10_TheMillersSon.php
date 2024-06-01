<?php

namespace AGestOfRobinHood\Cards\Travellers;

class Traveller10_TheMillersSon extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller10_TheMillersSon';
    $this->title = clienttranslate('The Miller’s Son');
    $this->titleLight = clienttranslate('Quick shilling');
    $this->textLight = clienttranslate('If successful, gain 2 Shillings and put the card in the discard pile. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('A new recruit');
    $this->textDark = clienttranslate('If successful, gain 1 Shilling, place a Hidden Merry Man in the Rob space or an adjacent space, and put the card in the Victims Pile. If failed, put a Henchman in the Rob space, then put the card in the discard pile.');
    $this->strength = 0;
    $this->setupLocation = TRAVELLERS_DECK;
  }
}
