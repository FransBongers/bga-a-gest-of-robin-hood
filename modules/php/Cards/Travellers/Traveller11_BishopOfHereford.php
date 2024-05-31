<?php

namespace AGestOfRobinHood\Cards\TravellerCard;

class Traveller11_BishopOfHereford extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller11_BishopOfHereford';
    $this->title = clienttranslate('Bishop Of Hereford');
    $this->titleLight = clienttranslate('Forced donation');
    $this->textLight = clienttranslate('If successful, gain 3 Shillings and discard the card. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('Repent!');
    $this->textDark = clienttranslate('If successful, gain 6 Shillings and put the card in the Victims Pile. If failed, the Sheriff gains 3 Shillings and sets the space to Submissive (if possible), then put the card in the discard pile.');
    $this->strength = 1;
  }
}
