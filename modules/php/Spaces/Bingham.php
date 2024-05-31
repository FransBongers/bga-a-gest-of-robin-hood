<?php
namespace AGestOfRobinHood\Spaces;

class Bingham extends \AGestOfRobinHood\Models\Space
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = BINGHAM;
    $this->name = clienttranslate('Bingham');
    $this->setupStatus = SUBMISSIVE;
    $this->adjacentSpaces = [

    ];
  }
}
