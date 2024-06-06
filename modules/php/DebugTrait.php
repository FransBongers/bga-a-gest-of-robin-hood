<?php

namespace AGestOfRobinHood;

use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;
use AGestOfRobinHood\Models\AtomicAction;
use AGestOfRobinHood\Helpers\Utils;

trait DebugTrait
{



  function test()
  {
    


    // Notifications::log('spaceIds', $spaceIds);
    // Notifications::log('args', GameMap::getSpacesWithMerryMen());
    // Forces::getUiData();
    // Notifications::log('order', GameMap::getNumberOfCarriages());
    $merryMen = Forces::get(['merryMen_2', 'merryMen_5']);
    foreach($merryMen as $merryMan) {
      $merryMan->reveal();
    }
  }

  function ed()
  {
    $this->engineDisplay();
  }

  function engineDisplay()
  {
    Notifications::log('engine', Globals::getEngine());
  }

}
