<?php
namespace AGestOfRobinHood\Spaces;

class Retford extends \AGestOfRobinHood\Models\Space
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = RETFORD;
    $this->name = clienttranslate('Retford');
    $this->setupStatus = SUBMISSIVE;
    $this->adjacentSpaceIds = [
      BLYTH,
    ];
    $this->road = TUXFORD;
  }
}
