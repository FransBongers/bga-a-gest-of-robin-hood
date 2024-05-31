<?php

namespace AGestOfRobinHood\Cards\TravellerCard;

class Traveller04_NobleKnight extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller04_NobleKnight';
    $this->title = clienttranslate('Noble Knight');
    $this->titleLight = clienttranslate('Pas d’armes');
    $this->textLight = clienttranslate('If successful, gain 3 Shillings and put the card in the discard pile. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('Mug him!');
    $this->textDark = clienttranslate('If successful, gain 5 Shillings and put the card in the Victims Pile. If failed, send the Robbing Merry Men to Prison and put the card in the discard pile.');
    $this->strength = 2;
  }
}
