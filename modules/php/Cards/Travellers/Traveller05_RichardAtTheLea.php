<?php

namespace AGestOfRobinHood\Cards\TravellerCard;

class Traveller05_RichardAtTheLea extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller05_RichardAtTheLea';
    $this->title = clienttranslate('Richard At the Lea');
    $this->titleLight = clienttranslate('Extortion');
    $this->textLight = clienttranslate('If successful, gain 2 Shillings and put the card in the discard pile. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('Lend money');
    $this->textDark = clienttranslate('Spend 3 Shillings without rolling to set Retford to Revolting and place a Camp there (shift one step towards Justice), then remove the card from the game.');
    $this->strength = 1;
  }
}
