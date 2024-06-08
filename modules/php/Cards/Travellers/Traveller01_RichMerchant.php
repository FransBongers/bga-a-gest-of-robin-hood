<?php

namespace AGestOfRobinHood\Cards\Travellers;

class Traveller01_RichMerchant extends \AGestOfRobinHood\Cards\Travellers\Traveller_RichMerchant
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller01_RichMerchant';
  }
}
