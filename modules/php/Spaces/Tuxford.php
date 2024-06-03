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
    $this->adjacentSpaces = [

    ];
    $this->road = SOUTHWELL_FOREST;
  }
}
