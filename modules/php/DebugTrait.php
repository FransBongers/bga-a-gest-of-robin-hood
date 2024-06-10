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
    Forces::get(ROBIN_HOOD)->setLocation(ROBIN_HOOD_SUPPLY);
    // Forces::get('merryMen_9')->setLocation(NEWARK);
    // Forces::getTopOf(CAMPS_SUPPLY)->setLocation(BINGHAM);
    // AtomicActions::get(ROYAL_INSPECTION_REDEPLOYMENT_SHERIFF)->getOptions();
    // $result = array_values(Spaces::getAll());
    // $rh->hide(Players::get());

    // Players::getRobinHoodPlayer()->incShillings(10);
    // Forces::get(ROBIN_HOOD)->setHidden(0);
    // $this->debugPlaceHenchmen(REMSTON, 2);

    // $action = $node->getActionResolutionArgs()['action'];

    // Notifications::log('card', Cards::get('Traveller04_NobleKnight')->getStaticData());
  }

  public function debugDeck()
  {
    Notifications::log('deck', Cards::getInLocationOrdered(EVENTS_DECK)->toArray());
  }

  public function debugPlaceHenchmen($spaceId, $number)
  {
    $result = [];
    for ($i = 0; $i < $number; $i++) {
      $henchman = Forces::getTopOf(HENCHMEN_SUPPLY);
      if ($henchman === null) {
        continue;
      }
      $henchman->setLocation($spaceId);
      $result[] = $henchman;
    }
    return $result;
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
