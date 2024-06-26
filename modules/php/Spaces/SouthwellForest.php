<?php
namespace AGestOfRobinHood\Spaces;

class SouthwellForest extends \AGestOfRobinHood\Models\Space
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = SOUTHWELL_FOREST;
    $this->name = clienttranslate('Southwell Forest');
    $this->setupStatus = PASSIVE;
    $this->adjacentSpaceIds = [
      NOTTINGHAM,
      SHIRE_WOOD,
      TUXFORD,
    ];
    $this->adjacentViaOllertonHillSpaceIds = [
      BLYTH
    ];
    $this->road = NOTTINGHAM;
  }
}
