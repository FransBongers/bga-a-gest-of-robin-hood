<?php

namespace AGestOfRobinHood\Forces;

use AGestOfRobinHood\Helpers\Locations;

class Camp extends \AGestOfRobinHood\Models\Force
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->name = clienttranslate('Camp');
    $this->publicName = clienttranslate('Camp');
    $this->publicType = CAMP;
    $this->supply = CAMPS_SUPPLY;
  }

}
