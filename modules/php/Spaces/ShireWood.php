<?php
namespace AGestOfRobinHood\Spaces;

class ShireWood extends \AGestOfRobinHood\Models\Space
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = SHIRE_WOOD;
    $this->name = clienttranslate('Shire Wood');
    $this->setupStatus = REVOLTING;
    $this->adjacentSpaces = [

    ];
    $this->road = NOTTINGHAM;
  }
}
