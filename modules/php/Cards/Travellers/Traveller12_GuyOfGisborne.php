<?php

namespace AGestOfRobinHood\Cards\TravellerCard;

class Traveller12_GuyOfGisborne extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller12_GuyOfGisborne';
    $this->title = clienttranslate('Guy of Gisborne');
    $this->titleLight = clienttranslate('Fight!');
    $this->textLight = clienttranslate('If successful, remove the card from the game. If failed, place all Robbing Merry Men in Prison (+1 Order if Robin Hood is among them) and discard the card.');
    $this->strength = 3;
  }
}
