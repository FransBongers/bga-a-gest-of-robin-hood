<?php
namespace AGestOfRobinHood\Spaces;

class Nottingham extends \AGestOfRobinHood\Models\Space
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = NOTTINGHAM;
    $this->name = clienttranslate('Nottingham');
    $this->setupStatus = SUBMISSIVE;
    $this->adjacentSpaceIds = [
      MANSFIELD,
      SHIRE_WOOD,
      SOUTHWELL_FOREST,
    ];
  }
}
