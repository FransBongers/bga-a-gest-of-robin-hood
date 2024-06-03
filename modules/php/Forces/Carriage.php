<?php

namespace AGestOfRobinHood\Forces;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Managers\Players;

class Carriage extends \AGestOfRobinHood\Models\Force
{

  public function reveal()
  {
    $this->setHidden(0);
    Notifications::revealCarriage(Players::getSheriffPlayer(), $this);
  }

}
