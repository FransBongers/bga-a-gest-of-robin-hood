<?php

namespace AGestOfRobinHood\Managers;

use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Players;
/*
 * Table to store additional player data
 */

class PlayersExtra extends \AGestOfRobinHood\Helpers\DB_Manager
{
  protected static $table = 'player_extra';
  protected static $primary = 'player_id';
  protected static function cast($row)
  {
    return $row;
  }

  public static function setupNewGame()
  {

    $players = Players::getAll();

    // $firstPlayerId = self::getFirstPlayer();
    // Globals::setFirstPlayer($firstPlayerId);

    // $turnOrder = Players::getTurnOrder($firstPlayerId);

    foreach ($players as $playerId => $player) {
      $side = COLOR_SIDE_MAP[$player->getColor()];

      self::DB()->insert([
        'player_id' => $playerId,
        'shillings' => $side === SHERIFF ? 9 : 5,
        'side' => COLOR_SIDE_MAP[$players[$playerId]->getColor()],
      ]);
    }
  }

  /*
   * get : returns the Player object for the given player ID
   */
  public static function get($playerId = null)
  {
    $playerId = $playerId ?: Players::getActiveId();
    return self::DB()
      ->where($playerId)
      ->getSingle();
  }

  public static function getAll()
  {
    $players = self::DB()->get(false);
    return $players;
  }
}
