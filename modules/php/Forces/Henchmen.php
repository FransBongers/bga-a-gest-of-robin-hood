<?php

namespace AGestOfRobinHood\Forces;

use AGestOfRobinHood\Helpers\Locations;

class Henchmen extends \AGestOfRobinHood\Models\Force
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->name = clienttranslate('Henchman');
    $this->publicName = clienttranslate('Henchman');
    $this->publicType = HENCHMEN;
    $this->supply = HENCHMEN_SUPPLY;
  }

}
