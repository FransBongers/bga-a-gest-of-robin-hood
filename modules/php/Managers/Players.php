<?php

namespace AGestOfRobinHood\Managers;

use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\PlayersExtra;

/*
 * Players manager : allows to easily access players ...
 *  a player is an instance of Player class
 */

class Players extends \AGestOfRobinHood\Helpers\DB_Manager
{
  protected static $table = 'player';
  protected static $primary = 'player_id';
  protected static function cast($row)
  {
    return new \AGestOfRobinHood\Models\Player($row);
  }

  public static function setupNewGame($players, $options)
  {
    // Globals::setPlayers($players);
    // Create players
    $gameInfos = Game::get()->getGameinfos();
    $colors = $gameInfos['player_colors'];
    $query = self::DB()->multipleInsert([
      'player_id',
      'player_color',
      'player_canal',
      'player_name',
      'player_avatar',
      'player_score',
      // 'rupees'
    ]);

    $values = [];

    $rolesOption = Globals::getGameOptionRoles();
    $thereIsATableAdmin = Utils::array_some(array_values($players), function ($player) {
      return isset($player['player_is_admin']) && intval($player['player_is_admin']) === 1;
    });

    foreach ($players as $playerId => $player) {
      $color = null;
      if ($rolesOption > 0 && $thereIsATableAdmin) {
        $playerIsTableAdmin = isset($player['player_is_admin']) && intval($player['player_is_admin']) === 1;
        if ($playerIsTableAdmin && $rolesOption === 1) {
          $color = $colors[0];
        } else if (!$playerIsTableAdmin && $rolesOption === 1) {
          $color = $colors[1];
        } else if ($playerIsTableAdmin && $rolesOption === 2) {
          $color = $colors[1];
        } else if (!$playerIsTableAdmin && $rolesOption === 2) {
          $color = $colors[0];
        }
      } else {
        $color = array_shift($colors);
      }
      
      $values[] = [$playerId, $color, $player['player_canal'], $player['player_name'], $player['player_avatar'], 0];
    }

    $query->values($values);

    // Game::get()->reattributeColorsBasedOnPreferences($players, $gameInfos['player_colors']);
    Game::get()->reloadPlayersBasicInfos();
    PlayersExtra::setupNewGame();

    self::getSheriffPlayer()->setScore(1);
  }

  public static function getActiveId()
  {
    return (int) Game::get()->getActivePlayerId();
  }

  public static function getCurrentId()
  {
    return intval(Game::get()->getCurrentPId());
  }

  public static function getAll()
  {
    $players = self::DB()->get(false);
    return $players;
  }

  /*
   * get : returns the Player object for the given player ID
   */
  public static function get($playerId = null)
  {
    $playerId = $playerId ?: self::getActiveId();
    return self::DB()
      ->where($playerId)
      ->getSingle();
  }

  public static function getOther($playerId = null)
  {
    $playerId = $playerId ?: self::getActiveId();
    return Utils::array_find(Players::getAll()->toArray(), function ($player) use ($playerId) {
      return $player->getId() !== $playerId;
    });
  }

  public static function incScore($playerId, $increment)
  {
    $value = self::get($playerId)->getScore() + $increment;
    return self::DB()->update(['player_score' => $value], $playerId);
  }

  public static function setPlayerScoreAux($playerId, $value)
  {
    return self::DB()->update(['player_score_aux' => $value], $playerId);
  }

  public static function setPlayerScore($playerId, $value)
  {
    return self::DB()->update(['player_score' => $value], $playerId);
  }


  public function getMany($playerIds)
  {
    $players = self::DB()
      ->whereIn($playerIds)
      ->get();
    return $players;
  }

  public static function getActive()
  {
    return self::get();
  }

  public static function getCurrent()
  {
    return self::get(self::getCurrentId());
  }

  public function getNextId($player)
  {
    $playerId = is_int($player) ? $player : $player->getId();

    $table = Game::get()->getNextPlayerTable();
    return (int) $table[$playerId];
  }

  public function getPrevId($player)
  {
    $playerId = is_int($player) ? $player : $player->getId();

    $table = Game::get()->getPrevPlayerTable();
    $playerId = (int) $table[$playerId];

    return $playerId;
  }

  /*
   * Return the number of players
   */
  public function count()
  {
    return self::DB()->count();
  }

  /*
   * getUiData : get all ui data of all players
   */
  public static function getUiData($playerId)
  {
    return self::getAll()->map(function ($player) use ($playerId) {
      return $player->jsonSerialize($playerId);
    });
  }

  public static function getPlayerOrder()
  {
    $players = self::getAll()->toArray();
    usort($players, function ($a, $b) {
      return $a->getNo() - $b->getNo();
    });
    $playerOrder = array_map(function ($player) {
      return $player->getId();
    }, $players);
    return $playerOrder;
  }

  /*
   * Get current turn order according to first player variable
   */
  public static function getTurnOrder($firstPlayer = null)
  {
    $players = self::getAll()->toArray();
    usort($players, function ($a, $b) {
      return $a->getNo() - $b->getNo();
    });
    $playerOrder = array_map(function ($player) {
      return $player->getId();
    }, $players);
    return $playerOrder;
  }

  /**
   * This activate next player
   */
  public function activeNext()
  {
    $playerId = self::getActiveId();
    $nextPlayer = self::getNextId((int) $playerId);

    Game::get()->gamestate->changeActivePlayer($nextPlayer);
    return $nextPlayer;
  }

  /**
   * This allow to change active player
   */
  public function changeActive($playerId)
  {
    Game::get()->gamestate->changeActivePlayer($playerId);
  }


  // ..######......###....##.....##.########
  // .##....##....##.##...###...###.##......
  // .##.........##...##..####.####.##......
  // .##...####.##.....##.##.###.##.######..
  // .##....##..#########.##.....##.##......
  // .##....##..##.....##.##.....##.##......
  // ..######...##.....##.##.....##.########

  // .##.....##.########.########.##.....##..#######..########...######.
  // .###...###.##..........##....##.....##.##.....##.##.....##.##....##
  // .####.####.##..........##....##.....##.##.....##.##.....##.##......
  // .##.###.##.######......##....#########.##.....##.##.....##..######.
  // .##.....##.##..........##....##.....##.##.....##.##.....##.......##
  // .##.....##.##..........##....##.....##.##.....##.##.....##.##....##
  // .##.....##.########....##....##.....##..#######..########...######.

  public static function getPlayersPerFaction()
  {
    $players = self::getAll()->toArray();

    return [
      ROBIN_HOOD => Utils::array_find($players, function ($player) {
        return $player->isRobinHood();
      }),
      SHERIFF => Utils::array_find($players, function ($player) {
        return $player->isSheriff();
      }),
    ];
  }

  public static function getRobinHoodPlayer()
  {
    return self::get(self::getPlayerIdForSide(ROBIN_HOOD));
  }

  public static function getRobinHoodPlayerId()
  {
    return self::getPlayerIdForSide(ROBIN_HOOD);
  }

  public static function getSheriffPlayer()
  {
    return self::get(self::getPlayerIdForSide(SHERIFF));
  }

  public static function getSheriffPlayerId()
  {
    return self::getPlayerIdForSide(SHERIFF);
  }

  public static function getPlayerIdForSide($side)
  {
    $playerId = Utils::array_find(PlayersExtra::getAll()->toArray(), function ($playerExtra) use ($side) {
      return $playerExtra['side'] === $side;
    })['player_id'];
    return intval($playerId);
  }

  public static function getEligibilityOrder()
  {
    $order = [];
    $firstEligible = Markers::getTopOf(Locations::initiativeTrack(FIRST_ELIGIBLE));
    if ($firstEligible->getId() === ROBIN_HOOD_ELIGIBILITY_MARKER) {
      // $order[] = Players::get(self::getRobinHoodPlayerId())->getId();
      $order[] = self::getRobinHoodPlayerId();
    } else {
      // $order[] = Players::get(self::getSheriffPlayerId())->getId();
      $order[] = self::getSheriffPlayerId();
    }
    $secondEligible = Markers::getTopOf(Locations::initiativeTrack(SECOND_ELIGIBLE));
    if ($secondEligible->getId() === ROBIN_HOOD_ELIGIBILITY_MARKER) {
      // $order[] = Players::get(self::getRobinHoodPlayerId())->getId();
      $order[] = self::getRobinHoodPlayerId();
    } else {
      // $order[] = Players::get(self::getSheriffPlayerId())->getId();
      $order[] = self::getSheriffPlayerId();
    };
    return $order;
  }

  public static function incShillings($playerId, $increment)
  {
    $value = intval(PlayersExtra::get($playerId)['shillings']) + $increment;
    return PlayersExtra::DB()->update(['shillings' => $value], $playerId);
  }

  public static function moveRoyalFavour($player, $steps, $direction, $royalInspection = false)
  {
    $rfMarker = Markers::get(ROYAL_FAVOUR_MARKER);
    $currentLocation = $rfMarker->getLocation();
    $splitLocation = explode('_', $currentLocation);
    $sameDirection = Utils::startsWith($currentLocation, $direction);

    $currentValue = intval($splitLocation[1]);
    $currentTrack = $splitLocation[0];
    $newValue = 0;

    if ($sameDirection) {
      $newValue = min($currentValue + $steps, 7);
    } else {
      $newValue = $currentValue - $steps;
    }
    $trackChanges = $newValue <= 0;

    if ($trackChanges) {
      $newValue = abs($newValue) + 1;
    }

    $otherDirection = Utils::startsWith($currentTrack, ORDER) ? JUSTICE : ORDER;

    $newLocation = $trackChanges ? Locations::royalFavourTrack($otherDirection, $newValue) : implode('_', [$currentTrack, $newValue]);

    $rfMarker->setLocation($newLocation);

    $players = self::getPlayersPerFaction();

    $scores = [
      ROBIN_HOOD => Utils::startsWith($newLocation, JUSTICE) ? $newValue : 0,
      SHERIFF => Utils::startsWith($newLocation, ORDER) ? $newValue : 0,
    ];

    $players[ROBIN_HOOD]->setScore($scores[ROBIN_HOOD]);
    $players[SHERIFF]->setScore($scores[SHERIFF]);

    Notifications::moveRoyalFavourMarker($player, $rfMarker, $steps, $direction, $royalInspection, [
      $players[ROBIN_HOOD]->getId() => $scores[ROBIN_HOOD],
      $players[SHERIFF]->getId() => $scores[SHERIFF],
    ]);


    // $otherPlayer = Players::getOther($player->getId());
    // // $location = $vpMarker->getLocation();

    // $score = $player->getScore();

    // $updatedScore = 0;
    // if ($score < 0) {
    //   $updatedScore = $score + $points;
    //   if ($updatedScore >= 0) {
    //     $updatedScore += 1;
    //   }
    // } else {
    //   $updatedScore = $score + $points;
    // }
    // $player->setScore($updatedScore);
    // $otherPlayer->setScore($updatedScore * -1);

    // $vpMarker->setLocation(Locations::victoryPointsTrack($updatedScore > 0 ? $player->getFaction() : $otherPlayer->getFaction(), abs($updatedScore)));

    // Notifications::scoreVictoryPoints($player, $otherPlayer, $vpMarker, $points);
  }
}
