<?php
namespace AGestOfRobinHood\Spaces;

class Mansfield extends \AGestOfRobinHood\Models\Space
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = MANSFIELD;
    $this->name = clienttranslate('Mansfield');
    $this->setupStatus = SUBMISSIVE;
    $this->adjacentSpaceIds = [
      NOTTINGHAM,
      REMSTON,
      SHIRE_WOOD,
    ];
    $this->road = SHIRE_WOOD;
  }
}
