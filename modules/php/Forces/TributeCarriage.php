<?php

namespace AGestOfRobinHood\Forces;

class TributeCarriage extends \AGestOfRobinHood\Forces\Carriage
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->name = clienttranslate('Tribute Carriage');
  }

  public function getCarriageGainsSheriff()
  {
    return [
      'shillings' => 2,
      'royalFavour' => 2,
    ];
  }
}
