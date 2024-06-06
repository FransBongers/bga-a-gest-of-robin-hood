<?php
namespace AGestOfRobinHood\Spaces;

class OllertonHill extends \AGestOfRobinHood\Models\Space
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = OLLERTON_HILL;
    $this->name = clienttranslate('Ollerton Hill');
    $this->setupStatus = PASSIVE;
    $this->adjacentSpaceIds = [

    ];
  }
}
