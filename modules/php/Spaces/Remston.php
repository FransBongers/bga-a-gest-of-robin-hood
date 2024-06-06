<?php
namespace AGestOfRobinHood\Spaces;

class Remston extends \AGestOfRobinHood\Models\Space
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = REMSTON;
    $this->name = clienttranslate('Remston');
    $this->setupStatus = REVOLTING;
    $this->adjacentSpaceIds = [
      BINGHAM,
      MANSFIELD,
    ];
    $this->road = MANSFIELD;
  }
}
