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
    // $merryMan = Forces::getTopOf(MERRY_MEN_SUPPLY);
    
    // $merryMan = Forces::get(ROBIN_HOOD);
    // $merryMan->setLocation(PRISON);
    // $merryMan->setHidden(0);
    // Spaces::get(TUXFORD)->revolt(Players::get());
    // Forces::get(ROBIN_HOOD)->setLocation(PRISON);
    // Forces::get(ROBIN_HOOD)->setHidden(0);
    // Forces::get('merryMen_6')->setHidden(0);
    // Forces::get('merryMen_4')->setHidden(1);
    
    Cards::get('Event13_Ambush')->insertOnTop(EVENTS_DECK);
    // Globals::setOllertonHillAdjacency(true);
    // Cards::get('Traveller07_Monks')->setLocation(TRAVELLERS_DISCARD);
    // $this->debugPlaceForces(TALLAGE_CARRIAGE,TUXFORD,1);
    // $this->debugPlaceMerryMen(SHIRE_WOOD, 2);
    // $this->debugPlaceMerryMen(SOUTHWELL_FOREST, 1);
    // Forces::get(ROBIN_HOOD)->setLocation(ROBIN_HOOD_SUPPLY);
    // Forces::get('merryMen_9')->setLocation(NEWARK);
    // Forces::getTopOf(CAMPS_SUPPLY)->setLocation(BINGHAM);
    // AtomicActions::get(ROYAL_INSPECTION_REDEPLOYMENT_SHERIFF)->getOptions();
    // $result = array_values(Spaces::getAll());
    // $rh->hide(Players::get());

    // Players::getRobinHoodPlayer()->incShillings(10);
    // Forces::get(ROBIN_HOOD)->setHidden(0);
    // $this->debugPlaceHenchmen(REMSTON, 2);

    // $action = $node->getActionResolutionArgs()['action'];

    // Notifications::log('bridge', Globals::getBridgeLocation());
  }

  public function debugDeck()
  {
    Notifications::log('deck', Cards::getInLocationOrdered(EVENTS_DECK)->toArray());
  }

  public function debugPlaceForces($type, $spaceId, $number)
  {
    $supplyMap = [
      HENCHMEN => HENCHMEN_SUPPLY,
      ROBIN_HOOD => ROBIN_HOOD_SUPPLY,
      MERRY_MEN => MERRY_MEN_SUPPLY,
      TALLAGE_CARRIAGE => CARRIAGE_SUPPLY,
      TRAP_CARRIAGE => CARRIAGE_SUPPLY,
      TRIBUTE_CARRIAGE => CARRIAGE_SUPPLY,
    ];

    $result = [];
    for ($i = 0; $i < $number; $i++) {
      $force = Forces::getTopOf($supplyMap[$type]);
      if ($force === null) {
        continue;
      }
      $force->setLocation($spaceId);
      $result[] = $force;
    }
    return $result;
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

  public function debugPlaceMerryMen($spaceId, $number)
  {
    $result = [];
    for ($i = 0; $i < $number; $i++) {
      $henchman = Forces::getTopOf(MERRY_MEN_SUPPLY);
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
