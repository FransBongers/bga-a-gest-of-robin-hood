<?php

namespace AGestOfRobinHood\Cards\Travellers;

class Traveller01_RichMerchant extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller01_RichMerchant';
    $this->title = clienttranslate('Rich Merchant');
    $this->titleLight = clienttranslate('"Invitation" to dinner');
    $this->textLight = clienttranslate('If successful, gain 2 Shillings and put the card in the discard pile. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('Fleece him!');
    $this->textDark = clienttranslate('If successful, gain 4 Shillings and put the card in the Victims Pile. If failed, Sheriff gains 2 Shillings and put the card in the discard pile.');
    $this->strength = 1;
    $this->setupLocation = TRAVELLERS_DECK;
  }
}