<?php

namespace AGestOfRobinHood\Core;

use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;

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

  // TODO: check how to handle this in game log
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

  private static function getActionName($action)
  {
    $map = [
      SINGLE_PLOT => clienttranslate('Single Plot'),
      EVENT => clienttranslate('Event'),
      PLOTS_AND_DEEDS => clienttranslate("Plots & Deeds"),
    ];
    return $map[$action];
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

  public static function chooseAction($player, $marker, $action)
  {
    self::notifyAll("chooseAction", clienttranslate('${player_name} chooses ${tkn_boldText_actionName}'), [
      'player' => $player,
      'tkn_boldText_actionName' => self::getActionName($action),
      'marker' => $marker,
      'i18n' => ['tkn_boldText_actionName']
    ]);
  }

  public static function drawAndRevealCard($card)
  {
    self::notifyAll("drawAndRevealCard", clienttranslate('A new card is drawn from the Event deck: ${tkn_boldText_cardTitle}'), [
      'card' => $card,
      'tkn_boldText_cardTitle' => $card->getTitle(),
    ]);
  }

  public static function firstEligible($marker)
  {
    $player = $marker->getId() === ROBIN_HOOD_ELIGIBILITY_MARKER ? Players::get(Players::getRobinHoodPlayerId()) : Players::get(Players::getSheriffPlayerId());

    self::notifyAll("chooseAction", clienttranslate('${player_name} becomes ${tkn_boldText_eligible}'), [
      'player' => $player,
      'tkn_boldText_eligible' => clienttranslate('First Eligible'),
      'marker' => $marker,
      'i18n' => ['tkn_boldText_eligible']
    ]);
  }

  public static function gainShillings($player, $amount)
  {
    self::notifyAll("gainShillings", clienttranslate('${player_name} gains ${amount} Shillings'), [
      'player' => $player,
      'amount' => $amount,
    ]);
  }

  public static function moveCarriage($player, $carriage, $fromSpace, $toSpace, $henchman)
  {
    $privateText = $henchman !== null ?
      clienttranslate('Private: ${player_name} moves a Carriage and a Henchman from ${tkn_boldText_from} to ${tkn_boldText_to}') :
      clienttranslate('Private: ${player_name} moves a Carriage from ${tkn_boldText_from} to ${tkn_boldText_to}');

    self::notify($player, 'moveCarriagePrivate', $privateText, [
      'player' => $player,
      'tkn_boldText_from' => $fromSpace->getName(),
      'tkn_boldText_to' => $toSpace->getName(),
      'carriage' => $carriage->jsonSerialize(),
      'henchman' => $henchman,
      'toSpaceId' => $toSpace->getId(),
      'i18n' => ['tkn_boldText_from', 'tkn_boldText_to'],
    ]);

    $text = $henchman !== null ?
      clienttranslate('${player_name} moves a Carriage and a Henchman from ${tkn_boldText_from} to ${tkn_boldText_to}') :
      clienttranslate('${player_name} moves a Carriage from ${tkn_boldText_from} to ${tkn_boldText_to}');
    $carriageIsHidden = $carriage->isHidden();

    self::notifyAll('moveCarriage', $text, [
      'player' => $player,
      'tkn_boldText_from' => $fromSpace->getName(),
      'tkn_boldText_to' => $toSpace->getName(),
      'carriage' => [
        'hidden' => $carriageIsHidden,
        'type' => $carriageIsHidden ? null : $carriage->getType(),
      ],
      'henchman' => $henchman,
      'toSpaceId' => $toSpace->getId(),
      'fromSpaceId' => $fromSpace->getId(),
      'i18n' => ['tkn_boldText_from', 'tkn_boldText_to'],
    ]);
  }

  public static function revealCarriage($player, $carriage)
  {
    self::notifyAll("revealCarriage", clienttranslate('${player_name} reveals ${tkn_boldText_carriageName} in ${tkn_boldText_spaceName}'), [
      'player' => $player,
      'tkn_boldText_carriageName' => $carriage->getName(),
      'tkn_boldText_spaceName' => Spaces::get($carriage->getLocation())->getName(),
      'carriage' => $carriage->jsonSerialize(),
      'i18n' => ['tkn_boldText_carriageName', 'tkn_boldText_spaceName']
    ]);
  }

  public static function moveCarriageToUsedCarriages($player, $carriage, $fromSpaceId)
  {
    self::notifyAll('moveCarriagePublic', clienttranslate('${player_name} moves a Carriage to ${tkn_boldText_used}'), [
      'player' => $player,
      'tkn_boldText_used' => clienttranslate('Used Carriages'),
      'carriage' => $carriage->jsonSerialize(),
      'toSpaceId' => $carriage->getLocation(),
      'fromSpaceId' => $fromSpaceId,
      'i18n' => ['tkn_boldText_used'],
    ]);
  }

  public static function moveRoyalFavourMarker($player, $marker, $steps, $direction)
  {
    $text = $steps === 1 ?
      clienttranslate('${player_name} moves Royal Favour ${numberOfSteps} step towards ${tkn_boldText_direction}') :
      clienttranslate('${player_name} moves Royal Favour ${numberOfSteps} steps towards ${tkn_boldText_direction}');

    self::notifyAll("moveRoyalFavourMarker", $text, [
      'player' => $player,
      'tkn_boldText_direction' => $direction === ORDER ? clienttranslate('Order') : clienttranslate('Justice'),
      'marker' => $marker,
      'numberOfSteps' => $steps,
      'i18n' => ['tkn_boldText_direction']
    ]);
  }

  public static function passAction($player, $shillings)
  {
    $text = $shillings === 1 ?
      clienttranslate('${player_name} passes and gains ${amount} Shilling') :
      clienttranslate('${player_name} passes and gains ${amount} Shillings');

    self::notifyAll("gainShillings", $text, [
      'player' => $player,
      'amount' => $shillings,
    ]);
  }

  public static function secondEligible($marker)
  {
    $player = $marker->getId() === ROBIN_HOOD_ELIGIBILITY_MARKER ? Players::get(Players::getRobinHoodPlayerId()) : Players::get(Players::getSheriffPlayerId());

    self::notifyAll("chooseAction", clienttranslate('${player_name} becomes ${tkn_boldText_eligible}'), [
      'player' => $player,
      'tkn_boldText_eligible' => clienttranslate('Second Eligible'),
      'marker' => $marker,
      'i18n' => ['tkn_boldText_eligible']
    ]);
  }

  public static function selectedPlot($player, $plotName, $targetSpaces)
  {
    $count = count($targetSpaces);
    $spacesLog = clienttranslate('${tkn_boldText_space0}');
    if ($count === 2) {
      $spacesLog = clienttranslate('${tkn_boldText_space0} and ${tkn_boldText_space1}');
    } else if ($count === 3) {
      $spacesLog = clienttranslate('${tkn_boldText_space0}, ${tkn_boldText_space1} and ${tkn_boldText_space2}');
    }
    $spacesArgs = [
      'i18n' => [],
    ];
    foreach ($targetSpaces as $index => $space) {
      $spacesArgs['tkn_boldText_space' . $index] = $space->getName();
    }

    self::message(clienttranslate('${player_name} chooses to ${tkn_boldText_plotName} in ${spacesLog}'), [
      'player' => $player,
      'tkn_boldText_plotName' => $plotName,
      'spacesLog' => [
        'log' => $spacesLog,
        'args' => $spacesArgs,
      ],
      'i18n' => ['tkn_boldText_plotName']
    ]);
  }

  public static function setupRobinHood($player, $robinHood, $merryMen)
  {
    self::notify($player, 'setupRobinHoodPrivate', clienttranslate('Private: ${player_name} places forces'), [
      'player' => $player,
      'you' => '${you}',
      'robinHood' => $robinHood,
      'merryMen' => $merryMen,
    ]);

    $merryMenCounts = [
      SHIRE_WOOD => 0,
      SOUTHWELL_FOREST => 0,
      REMSTON => 0,
    ];

    $merryMenCounts[$robinHood->getLocation()] += 1;
    foreach ($merryMen as $merryMan) {
      $merryMenCounts[$merryMan->getLocation()] += 1;
    }

    self::notifyAll("setupRobinHood", clienttranslate('${player_name} places Forces'), [
      'player' => $player,
      'merryMenCounts' => $merryMenCounts,
    ]);
  }
}
