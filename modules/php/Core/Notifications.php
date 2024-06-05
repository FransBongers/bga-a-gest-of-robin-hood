<?php

namespace AGestOfRobinHood\Core;

class Notifications
{
  // .########...#######..####.##.......########.########.
  // .##.....##.##.....##..##..##.......##.......##.....##
  // .##.....##.##.....##..##..##.......##.......##.....##
  // .########..##.....##..##..##.......######...########.
  // .##.....##.##.....##..##..##.......##.......##...##..
  // .##.....##.##.....##..##..##.......##.......##....##.
  // .########...#######..####.########.########.##.....##

  // .########..##..........###....########.########
  // .##.....##.##.........##.##......##....##......
  // .##.....##.##........##...##.....##....##......
  // .########..##.......##.....##....##....######..
  // .##........##.......#########....##....##......
  // .##........##.......##.....##....##....##......
  // .##........########.##.....##....##....########
  protected static function notifyAll($name, $msg, $data)
  {
    self::updateArgs($data);
    Game::get()->notifyAllPlayers($name, $msg, $data);
  }

  protected static function notify($player, $name, $msg, $data)
  {
    $playerId = is_int($player) ? $player : $player->getId();
    self::updateArgs($data);
    Game::get()->notifyPlayer($playerId, $name, $msg, $data);
  }

  public static function message($txt, $args = [])
  {
    self::notifyAll('message', $txt, $args);
  }

  public static function messageTo($player, $txt, $args = [])
  {
    $playerId = is_int($player) ? $player : $player->getId();
    self::notify($playerId, 'message', $txt, $args);
  }

  public static function newUndoableStep($player, $stepId)
  {
    self::notify($player, 'newUndoableStep', clienttranslate('Undo to here'), [
      'stepId' => $stepId,
      'preserve' => ['stepId'],
    ]);
  }

  public static function clearTurn($player, $notifIds)
  {
    self::notifyAll('clearTurn', clienttranslate('${player_name} restarts their turn'), [
      'player' => $player,
      'notifIds' => $notifIds,
    ]);
  }

  public static function refreshHand($player, $hand)
  {
    // foreach ($hand as &$card) {
    //   $card = self::filterCardDatas($card);
    // }
    self::notify($player, 'refreshHand', '', [
      'player' => $player,
      'hand' => $hand,
    ]);
  }

  public static function refreshUI($datas)
  {
    // Keep only the thing that matters
    $fDatas = [
      // Add data here that needs to be refreshed
    ];

    unset($datas['staticData']);

    self::notifyAll('refreshUI', '', [
      // 'datas' => $fDatas,
      'datas' => $datas,
    ]);
  }

  public static function log($message, $data)
  {
    // Keep only the thing that matters
    $fDatas = [
      // Add data here that needs to be refreshed
    ];

    self::notifyAll('log', '', [
      'message' => $message,
      'data' => $data,
    ]);
  }

  // .##.....##.########..########.....###....########.########
  // .##.....##.##.....##.##.....##...##.##......##....##......
  // .##.....##.##.....##.##.....##..##...##.....##....##......
  // .##.....##.########..##.....##.##.....##....##....######..
  // .##.....##.##........##.....##.#########....##....##......
  // .##.....##.##........##.....##.##.....##....##....##......
  // ..#######..##........########..##.....##....##....########

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  /*
   * Automatically adds some standard field about player and/or card
   */
  protected static function updateArgs(&$args)
  {
    if (isset($args['player'])) {
      $args['player_name'] = $args['player']->getName();
      $args['playerId'] = $args['player']->getId();
      unset($args['player']);
    }
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...



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

}
