<?php
namespace AGestOfRobinHood\Spaces;

class Tuxford extends \AGestOfRobinHood\Models\Space
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = TUXFORD;
    $this->name = clienttranslate('Tuxford');
    $this->setupStatus = SUBMISSIVE;
    $this->adjacentSpaceIds = [
      BLYTH,
      NEWARK,
      RETFORD,
      TUXFORD,
    ];
    $this->adjacentViaOllertonHillSpaceIds = [
      SHIRE_WOOD
    ];
    $this->road = SOUTHWELL_FOREST;
  }
}
