<?php

namespace AGestOfRobinHood;

use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Game;
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
    // Spaces::get(BLYTH)->revolt(Players::get());
    // Forces::get(ROBIN_HOOD)->setLocation(ROBIN_HOOD_SUPPLY);
    // Spaces::get(RETFORD)->setStatus(REVOLTING);
    // // Forces::get('camp_1')->setLocation(BLYTH);
    // $this->debugPlaceForces(ROBIN_HOOD,TUXFORD,1);
    // $this->debugPlaceForces(HENCHMEN,TUXFORD,3);
    // $this->debugPlaceForces(MERRY_MEN,BINGHAM,2);
    // $this->debugPlaceForces(HENCHMEN,RETFORD,1);
    // $this->debugPlaceForces(HENCHMEN,SHIRE_WOOD,1);
    // $this->debugPlaceForces(TRAP_CARRIAGE,SHIRE_WOOD,1);
    // $this->debugPlaceForces(CAMP,RETFORD,1);


    Cards::get('Event20_MajorOak')->insertOnTop(EVENTS_DECK);
    // Cards::get('Traveller05_RichardAtTheLea')->insertOnTop(TRAVELLERS_VICTIMS_PILE);
    // Cards::get('Traveller05_RichardAtTheLea')->insertOnTop(TRAVELLERS_DECK);

  }

  public function debug_Deck()
  {
    Notifications::log('deck', Cards::getInLocationOrdered(EVENTS_DECK)->toArray());
  }

  public function debugPlaceForces($type, $spaceId, $number = 1)
  {
    $supplyMap = [
      CAMP => CAMPS_SUPPLY,
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

  public function loadBugReportSQL(int $reportId, array $studioPlayers): void
  {
    $prodPlayers = $this->getObjectListFromDb("SELECT `player_id` FROM `player`", true);
    $prodCount = count($prodPlayers);
    $studioCount = count($studioPlayers);
    if ($prodCount != $studioCount) {
      throw new BgaVisibleSystemException("Incorrect player count (bug report has $prodCount players, studio table has $studioCount players)");
    }

    // SQL specific to your game
    $sql[] = 'ALTER TABLE `gamelog` ADD `cancel` TINYINT(1) NOT NULL DEFAULT 0;';
    // // For example, reset the current state if it's already game over
    // $sql = [
    //     "UPDATE `global` SET `global_value` = 10 WHERE `global_id` = 1 AND `global_value` = 99"
    // ];
    $map = [];
    foreach ($prodPlayers as $index => $prodId) {
      $studioId = $studioPlayers[$index];
      $map[(int) $prodId] = (int) $studioId;
      // SQL common to all games
      $sql[] = "UPDATE `player` SET `player_id` = $studioId WHERE `player_id` = $prodId";
      $sql[] = "UPDATE `global` SET `global_value` = $studioId WHERE `global_value` = $prodId";
      $sql[] = "UPDATE `stats` SET `stats_player_id` = $studioId WHERE `stats_player_id` = $prodId";

      // // SQL specific to your game
      $sql[] = "UPDATE `player_extra` SET `player_id` = $studioId WHERE `player_id` = $prodId";

      // $sql[] = "UPDATE `card` SET `card_location_arg` = $studioId WHERE `card_location_arg` = $prodId";
      // $sql[] = "UPDATE `my_table` SET `my_column` = REPLACE(`my_column`, $prodId, $studioId)";
    }
    foreach ($sql as $q) {
      $this->DbQuery($q);
    }

    // Engine
    $engine = Globals::getEngine();
    self::loadDebugUpdateEngine($engine, $map);
    Globals::setEngine($engine);
    Game::get()->reloadPlayersBasicInfos(); // Is this necessary?
  }

  static function loadDebugUpdateEngine(&$node, $map)
  {
    if (isset($node['playerId'])) {
      $node['playerId'] = $map[(int) $node['playerId']];
    }

    if (isset($node['children'])) {
      foreach ($node['children'] as &$child) {
        self::loadDebugUpdateEngine($child, $map);
      }
    }
  }
}
