<?php
namespace AGestOfRobinHood\Spaces;

class Blyth extends \AGestOfRobinHood\Models\Space
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = BLYTH;
    $this->name = clienttranslate('Blyth');
    $this->setupStatus = SUBMISSIVE;
    $this->adjacentSpaces = [

    ];
    $this->road = TUXFORD;
  }
}
