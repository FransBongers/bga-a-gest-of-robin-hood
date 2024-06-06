<?php
namespace AGestOfRobinHood\Spaces;

class Newark extends \AGestOfRobinHood\Models\Space
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = NEWARK;
    $this->name = clienttranslate('Newark');
    $this->setupStatus = SUBMISSIVE;
    $this->adjacentSpaceIds = [
      TUXFORD,
    ];
    $this->road = TUXFORD;
  }
}
