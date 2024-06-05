<?php

namespace AGestOfRobinHood\Forces;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Managers\Players;

class RobinHood extends \AGestOfRobinHood\Models\Force
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->name = clienttranslate('Robin Hood');
  }

  public function reveal($player = null)
  {
    $player === null ? Players::getRobinHoodPlayer() : $player;

    $this->setHidden(0);
    Notifications::revealRobinHood($player, $this);
  }
}
