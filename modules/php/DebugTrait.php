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

  function debug_test()
  {
    // Players::getSheriffPlayer()->incShillings(2);
    // $this->debugPlaceForces(MERRY_MEN,NEWARK,1);
    // Notifications::log('players', Players::getPlayersPerFaction());
    // Players::getRobinHoodPlayer()->incShillings(10);
    // $merryMan = Forces::getTopOf(MERRY_MEN_SUPPLY);
    // Spaces::get(BLYTH)->setStatus(SUBMISSIVE);
    // $merryMan = Forces::get(ROBIN_HOOD);
    // $merryMan->setLocation(PRISON);
    // $merryMan->setHidden(0);
    // Spaces::get(BLYTH)->revolt(Players::get());
    // Forces::get(ROBIN_HOOD)->setLocation(RETFORD);
    // Spaces::get(RETFORD)->setStatus(REVOLTING);
    // Forces::get('camp_1')->setLocation(BLYTH);
    // $this->debugPlaceForces(HENCHMEN,TUXFORD);
    // $this->debugPlaceForces(MERRY_MEN,TUXFORD,10);
    // Forces::get('merryMen_6')->setLocation(TUXFORD);
    // Forces::get('henchmen_4')->setLocation(RETFORD);
    // Forces::get('henchmen_2')->setLocation(BLYTH);
    
    // Forces::get('merryMen_6')->setHidden(0);
    // Forces::get('merryMen_8')->setLocation(PRISON);
    // Forces::get(ROBIN_HOOD)->setHidden(0);
    Forces::get(ROBIN_HOOD)->setLocation(ROBIN_HOOD_SUPPLY);
    // Forces::get('henchmen_18')->setLocation(NOTTINGHAM);
    // Forces::get(ROBIN_HOOD)->setLocation(ROBIN_HOOD_SUPPLY);
    // Forces::get('carriage_2')->setLocation(NEWARK);
    // Forces::get('merryMen_4')->setHidden(1);
    // Cards::get('Event24_MaidMarian')->insertOnTop(EVENTS_DECK);
    // Cards::get('Traveller02_RichMerchant')->insertOnTop(TRAVELLERS_VICTIMS_PILE);
    // Cards::get('Traveller05_RichardAtTheLea')->insertOnTop(TRAVELLERS_DECK);
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

    // Notifications::log('ballad', Cards::getBalladAndRound());
  }

  public function debug_Deck()
  {
    Notifications::log('deck', Cards::getInLocationOrdered(EVENTS_DECK)->toArray());
  }

  public function debugPlaceForces($type, $spaceId, $number = 1)
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

  // function debug_ed()
  // {
  //   $this->debug_engineDisplay();
  // }

  function debug_engineDisplay()
  {
    Notifications::log('engine', Globals::getEngine());
  }
}
