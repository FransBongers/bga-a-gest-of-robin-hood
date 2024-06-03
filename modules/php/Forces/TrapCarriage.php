<?php
namespace AGestOfRobinHood\Forces;

class TrapCarriage extends \AGestOfRobinHood\Forces\Carriage
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->name = clienttranslate('Trap Carriage');
  }

  public function getCarriageGainsSheriff()
  {
    return [
      'shillings' => 2,
      'royalFavour' => 1,
    ];
  }
}
