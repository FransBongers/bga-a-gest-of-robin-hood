<?php

namespace AGestOfRobinHood\Forces;

use AGestOfRobinHood\Helpers\Locations;

class MerryMen extends \AGestOfRobinHood\Models\Force
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->name = clienttranslate('Merry Man');
    $this->publicName = clienttranslate('Merry Man');
    $this->publicType = MERRY_MEN;
    $this->supply = MERRY_MEN_SUPPLY;
  }

}
