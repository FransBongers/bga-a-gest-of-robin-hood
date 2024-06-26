<?php

namespace AGestOfRobinHood\Forces;

class TallageCarriage extends \AGestOfRobinHood\Forces\Carriage
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->name = clienttranslate('Tallage Carriage');
    $this->publicName = clienttranslate('Carriage');
    $this->publicType = CARRIAGE;
    $this->supply = CARRIAGE_SUPPLY;
  }

  public function getCarriageGainsSheriff()
  {
    return [
      'shillings' => 5,
      'royalFavour' => 1,
    ];
  }
}
