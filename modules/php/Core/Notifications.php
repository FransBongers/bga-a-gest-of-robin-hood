<?php

namespace AGestOfRobinHood\Core;

use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Forces;
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
    unset($datas['robinHoodForces']);
    unset($datas['sheriffForces']);



    self::notifyAll('refreshUI', '', [
      // 'datas' => $fDatas,
      'datas' => $datas,
    ]);

    $forces = Forces::getUiData();
    $rhPlayer = Players::getRobinHoodPlayer();
    self::notify($rhPlayer, 'refreshForcesPrivate', '', [
      'forces' => $forces[ROBIN_HOOD],
      'player' => $rhPlayer,
    ]);
    $sheriffPlayer = Players::getSheriffPlayer();
    self::notify($sheriffPlayer, 'refreshForcesPrivate', '', [
      'forces' => $forces[SHERIFF],
      'player' => $sheriffPlayer,
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

  protected static function tknCardArg($card)
  {
    $cardId = $card->getId();
    return explode('_', $cardId)[0];
  }

  protected static function tknCardNameArg($card)
  {
    return explode('_', $card->getId())[0] . ':' . $card->getTitle();
  }

  protected static function tknDieResultArg($color, $result)
  {
    return $color . ':' . $result;
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

  // $moves[] = [
  //   'force' => $force,
  //   'from' => [
  //     'hidden' => true,
  //     'spaceId' => $robinHoodFromLocation,
  //     'space' => $fromSpace,
  //   ],
  //   'to' => [
  //     'hidden' => true,
  //     'spaceId' => $force->isRobinHood() ? $robinHoodSpaceId : $merryManSpaceId,
  //     'space' => $force->isRobinHood() ? $robinHoodSpace : $merryManSpace,
  //   ]
  // ];
  private static function mapMerryMenMoves($moves)
  {
    return array_map(function ($move) {

      $fromHidden = $move['from']['hidden'];
      $toHidden = $move['to']['hidden'];
      $force = $move['force'];
      $isRobinHood = $force->isRobinHood();
      return [
        'from' => [
          'type' => $isRobinHood && $fromHidden ? MERRY_MEN : $force->getType(),
          'hidden' => $move['from']['hidden'],
          'spaceId' => $move['from']['spaceId'],
        ],
        'to' => [
          'type' => $toHidden ? MERRY_MEN : $force->getType(),
          'hidden' => $toHidden,
          'spaceId' => $move['to']['spaceId'],
        ]
      ];
    }, $moves);
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

  public static function ambushLight($player, $forces, $moves, $space)
  {
    $text = clienttranslate('${player_name} moves Merry Men to ${tkn_boldText_toSpace}');

    self::notify($player, 'moveMerryMenPrivate', $text, [
      'player' => $player,
      'forces' => $forces,
      'tkn_boldText_toSpace' => $space->getName(),
      'i18n' => ['tkn_boldText_toSpace'],
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'player' => $player,
      'moves' => $moves,
      'tkn_boldText_toSpace' => $space->getName(),
      'i18n' => ['tkn_boldText_toSpace'],
      'preserve' => ['playerId'],
    ]);
  }

  public static function placeBridge($player, $borderId, $spaceIds)
  {
    $spaces = Spaces::get($spaceIds)->toArray();

    self::notifyAll("placeBridge", clienttranslate('${player_name} places the Bridge on the River border between ${tkn_boldText_spaceName} and ${tkn_boldText_spaceName2}'), [
      'player' => $player,
      'tkn_boldText_spaceName' => $spaces[0]->getName(),
      'tkn_boldText_spaceName2' => $spaces[1]->getName(),
      'borderId' => $borderId,
      'i18n' => ['tkn_boldText_spaceName', 'tkn_boldText_spaceName2']
    ]);
  }

  public static function captureMerryMen($player, $space, $capturedPieces)
  {
    self::notifyAll("captureMerryMen", clienttranslate('${player_name} Captures Merry Men in ${tkn_boldText_spaceName}'), [
      'player' => $player,
      'tkn_boldText_spaceName' => $space->getName(),
      'capturedPieces' => $capturedPieces,
      'i18n' => ['tkn_boldText_spaceName']
    ]);
  }

  public static function chooseAction($player, $marker, $action, $pass)
  {
    $text = $pass ?
      clienttranslate('${player_name} passes and places eligibility cylinder on ${tkn_boldText_actionName} box') :
      clienttranslate('${player_name} chooses ${tkn_boldText_actionName}');

    self::notifyAll("chooseAction", $text, [
      'player' => $player,
      'tkn_boldText_actionName' => self::getActionName($action),
      'marker' => $marker,
      'i18n' => ['tkn_boldText_actionName']
    ]);
  }

  public static function disperse($player, $space, $merryMen, $camps)
  {
    self::message(clienttranslate('${player_name} removes ${count} pieces from ${tkn_boldText_spaceName}'), [
      'player' => $player,
      'tkn_boldText_spaceName' => $space->getName(),
      'count' => count($merryMen) + count($camps),
      'i18n' => ['tkn_boldText_spaceName'],
    ]);
  }

  public static function drawAndRevealCard($card)
  {
    self::notifyAll("drawAndRevealCard", clienttranslate('A new card is drawn from the Event deck: ${tkn_cardName} ${tkn_card}'), [
      'card' => $card,
      'tkn_cardName' => self::tknCardNameArg($card),
      'tkn_card' => self::tknCardArg($card),
    ]);
  }

  public static function drawAndRevealTravellerCard($player, $card)
  {
    self::notifyAll("drawAndRevealTravellerCard", clienttranslate('${player_name} draws the top card of the Travellers deck: ${tkn_cardName} ${tkn_card}'), [
      'player' => $player,
      'card' => $card,
      'tkn_cardName' => self::tknCardNameArg($card),
      'tkn_card' => self::tknCardArg($card),
    ]);
  }

  public static function eventBoatsBridgesLight($player, $forces, $moves, $fromSpace, $toSpace)
  {
    $text = clienttranslate('${player_name} moves Merry Men from ${tkn_boldText_fromSpace} to ${tkn_boldText_toSpace}');

    self::notify($player, 'moveMerryMenPrivate', $text, [
      'player' => $player,
      'forces' => $forces,
      'tkn_boldText_fromSpace' => $fromSpace->getName(),
      'tkn_boldText_toSpace' => $toSpace->getName(),
      'i18n' => ['tkn_boldText_fromSpace', 'tkn_boldText_toSpace'],
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'player' => $player,
      'moves' => $moves,
      'tkn_boldText_fromSpace' => $fromSpace->getName(),
      'tkn_boldText_toSpace' => $toSpace->getName(),
      'i18n' => ['tkn_boldText_fromSpace', 'tkn_boldText_toSpace'],
      'preserve' => ['playerId'],
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

  public static function moveCarriage($player, $carriage, $fromSpace, $toSpace, $henchman = null)
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

    self::notifyAll('moveCarriagePublic', $text, [
      'player' => $player,
      'tkn_boldText_from' => $fromSpace->getName(),
      'tkn_boldText_to' => $toSpace->getName(),
      'carriage' => [
        'hidden' => $carriageIsHidden,
        'type' => $carriageIsHidden ? CARRIAGE : $carriage->getType(),
      ],
      'henchman' => $henchman,
      'toSpaceId' => $toSpace->getId(),
      'fromSpaceId' => $fromSpace->getId(),
      'i18n' => ['tkn_boldText_from', 'tkn_boldText_to'],
      'preserve' => ['playerId']
    ]);
  }

  public static function moveForces($player, $fromSpace, $toSpace, $forces)
  {
    // TODO: replace forces with icons
    self::notifyAll("moveForces", clienttranslate('${player_name} moves Forces from ${tkn_boldText_fromSpace} to ${tkn_boldText_toSpace}'), [
      'player' => $player,
      'tkn_boldText_fromSpace' => $fromSpace->getName(),
      'tkn_boldText_toSpace' => $toSpace->getName(),
      'forces' => $forces,
      'type' => $forces[0]->getType(),
      'toSpaceId' => $toSpace->getId(),
      'i18n' => ['tkn_boldText_fromSpace', 'tkn_boldText_toSpace']
    ]);
  }

  public static function revealCarriage($player, $carriage)
  {
    self::notifyAll("revealForce", clienttranslate('${player_name} reveals ${tkn_boldText_carriageName} in ${tkn_boldText_spaceName}'), [
      'player' => $player,
      'tkn_boldText_carriageName' => $carriage->getName(),
      'tkn_boldText_spaceName' => Spaces::get($carriage->getLocation())->getName(),
      'force' => $carriage->jsonSerialize(),
      'i18n' => ['tkn_boldText_carriageName', 'tkn_boldText_spaceName']
    ]);
  }

  public static function hideForce($player, $force)
  {
    self::notifyAll("hideForce", clienttranslate('${player_name} flips ${tkn_boldText_forceName} in ${tkn_boldText_spaceName} to hidden'), [
      'player' => $player,
      'tkn_boldText_forceName' => $force->getName(),
      'tkn_boldText_spaceName' => Spaces::get($force->getLocation())->getName(),
      'force' => $force->jsonSerialize(),
      'i18n' => ['tkn_boldText_forceName', 'tkn_boldText_spaceName']
    ]);
  }

  public static function revealForce($player, $force)
  {
    self::notifyAll("revealForce", clienttranslate('${player_name} reveals ${tkn_boldText_forceName} in ${tkn_boldText_spaceName}'), [
      'player' => $player,
      'tkn_boldText_forceName' => $force->getName(),
      'tkn_boldText_spaceName' => Spaces::get($force->getLocation())->getName(),
      'force' => $force->jsonSerialize(),
      'i18n' => ['tkn_boldText_forceName', 'tkn_boldText_spaceName']
    ]);
  }

  public static function revealRobinHood($player, $robinHood)
  {
    self::notifyAll("revealForce", clienttranslate('${player_name} reveals ${tkn_boldText_robinHood} in ${tkn_boldText_spaceName}'), [
      'player' => $player,
      'tkn_boldText_robinHood' => $robinHood->getName(),
      'tkn_boldText_spaceName' => Spaces::get($robinHood->getLocation())->getName(),
      'force' => $robinHood->jsonSerialize(),
      'i18n' => ['tkn_boldText_robinHood', 'tkn_boldText_spaceName']
    ]);
  }

  public static function moveCarriageToUsedCarriages($player, $carriage, $fromSpaceId = NOTTINGHAM)
  {
    $text = clienttranslate('${player_name} moves a Carriage to ${tkn_boldText_to}');
    $sheriffPlayer = Players::getSheriffPlayer();

    self::notify($sheriffPlayer, 'moveCarriagePrivate', $text, [
      'playerId' => $sheriffPlayer->getId(),
      'player_name' => $player->getName(),
      'tkn_boldText_to' => clienttranslate('Used Carriages'),
      'carriage' => $carriage->jsonSerialize(),
      'toSpaceId' => $carriage->getLocation(),
      'i18n' => ['tkn_boldText_from', 'tkn_boldText_to'],
    ]);

    self::notifyAll('moveCarriagePublic', $text, [
      'playerId' => $sheriffPlayer->getId(),
      'player_name' => $player->getName(),
      'tkn_boldText_to' => clienttranslate('Used Carriages'),
      'carriage' => [
        'hidden' => $carriage->isHidden(),
        'type' => $carriage->isHidden() ? $carriage->getPublicType() : $carriage->getType(),
      ],
      'toSpaceId' => $carriage->getLocation(),
      'fromSpaceId' => $fromSpaceId,
      'i18n' => ['tkn_boldText_from', 'tkn_boldText_to'],
      'preserve' => ['playerId']
    ]);
  }

  public static function moveRoyalFavourMarker($player, $marker, $steps, $direction, $royalInspection = false, $scores)
  {
    $text = $steps === 1 ?
      clienttranslate('${player_name} moves Royal Favour ${numberOfSteps} step towards ${tkn_boldText_direction}') :
      clienttranslate('${player_name} moves Royal Favour ${numberOfSteps} steps towards ${tkn_boldText_direction}');

    if ($royalInspection && $steps === 1) {
      $text = clienttranslate('Royal Favour shifts ${numberOfSteps} step towards ${tkn_boldText_direction}');
    } else if ($royalInspection) {
      $text = clienttranslate('Royal Favour shifts ${numberOfSteps} steps towards ${tkn_boldText_direction}');
    }

    self::notifyAll("moveRoyalFavourMarker", $text, [
      'player' => $player,
      'tkn_boldText_direction' => $direction === ORDER ? clienttranslate('Order') : clienttranslate('Justice'),
      'marker' => $marker,
      'numberOfSteps' => $steps,
      'scores' => $scores,
      'i18n' => ['tkn_boldText_direction']
    ]);
  }

  public static function moveRoyalInspectionMarker($marker)
  {
    self::notifyAll("moveRoyalInspectionMarker", '', [
      'marker' => $marker->jsonSerialize(),
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

  public static function payShillings($player, $amount)
  {
    $text = $amount === 1 ? clienttranslate('${player_name} pays ${amount} Shilling') : clienttranslate('${player_name} pays ${amount} Shillings');

    self::notifyAll("payShillings", $text, [
      'player' => $player,
      'amount' => $amount,
    ]);
  }

  public static function performDeed($player, $deed)
  {
    self::message(clienttranslate('${player_name} performs ${tkn_boldText_deedName} Deed'), [
      'player' => $player,
      'tkn_boldText_deedName' => $deed,
      'i18n' => ['tkn_boldText_deedName']
    ]);
  }

  public static function placeCardInTravellersDeck($player, $card)
  {
    self::notifyAll('placeCardInTravellersDeck', clienttranslate('${player_name} places ${tkn_cardName} in the Travellers Deck  ${tkn_card}'), [
      'player' => $player,
      'card' => $card,
      'tkn_cardName' => self::tknCardNameArg($card),
      'tkn_card' => self::tknCardArg($card),
    ]);
  }


  public static function placeForce($player, $force, $space)
  {
    self::notify($player, 'placeForcePrivate', clienttranslate('${player_name} places ${tkn_boldText_forceName} in ${tkn_boldText_spaceName}'), [
      'player' => $player,
      'you' => '${you}',
      'forces' => [$force],
      'spaceId' => $space->getId(),
      'tkn_boldText_forceName' => $force->getName(),
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_forceName', 'tkn_boldText_spaceName']
    ]);

    $isHidden = $force->isHidden();
    self::notifyAll('placeForce', clienttranslate('${player_name} places ${tkn_boldText_forceName} in ${tkn_boldText_spaceName}'), [
      'player' => $player,
      'force' => [
        'type' => $isHidden ? $force->getPublicType() : $force->getType(),
        'hidden' => $isHidden,
      ],
      'spaceId' => $space->getId(),
      'tkn_boldText_forceName' => $force->getPublicName(),
      'tkn_boldText_spaceName' => $space->getName(),
      'count' => 1,
      'i18n' => ['tkn_boldText_forceName', 'tkn_boldText_spaceName'],
      'preserve' => ['playerId'],
    ]);
  }

  public static function placeHenchmen($player, $forces, $space)
  {
    self::notifyAll('placeForceAll', clienttranslate('${player_name} places Henchmen in ${tkn_boldText_spaceName}'), [
      'player' => $player,
      'you' => '${you}',
      'forces' => $forces,
      'spaceId' => $space->getId(),
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_spaceName']
    ]);
  }

  public static function placeMerryMen($player, $robinHood, $merryMen, $textPublic, $textPrivate, $publicTextArgs = [],  $privateTextArgs = [])
  {
    self::notify($player, 'placeMerryMenPrivate', $textPrivate, array_merge($privateTextArgs, [
      'player' => $player,
      'robinHood' => $robinHood,
      'merryMen' => $merryMen,
    ]));

    $merryMenCounts = [];

    if ($robinHood !== null) {
      if (isset($merryMenCounts[$robinHood->getLocation()])) {
        $merryMenCounts[$robinHood->getLocation()] += 1;
      } else {
        $merryMenCounts[$robinHood->getLocation()] = 1;
      }
    }

    foreach ($merryMen as $merryMan) {
      if (isset($merryMenCounts[$merryMan->getLocation()])) {
        $merryMenCounts[$merryMan->getLocation()] += 1;
      } else {
        $merryMenCounts[$merryMan->getLocation()] = 1;
      }
    }

    self::notifyAll("placeMerryMenPublic", $textPublic, array_merge($publicTextArgs, [
      'player' => $player,
      'merryMenCounts' => $merryMenCounts,
      'preserve' => ['playerId'],
    ]));
  }

  public static function robinsHornLight($player,  $forces, $moves, $space)
  {
    $text = clienttranslate('${player_name} moves ${count} Merry Men to ${tkn_boldText_spaceName}');

    self::notify($player, 'moveMerryMenPrivate', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'forces' => $forces,
      'count' => count($forces),
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_spaceName']
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'moves' => $moves,
      'count' => count($forces),
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_spaceName'],
      'preserve' => ['playerId']
    ]);
  }

  public static function startOfRound($data)
  {
    $balladNumber = $data['balladNumber'];
    $eventNumber = $data['eventNumber'];

    $balladNumberMap = [
      0 => clienttranslate('Setup'),
      1 => clienttranslate('1st Ballad'),
      2 => clienttranslate('2nd Ballad'),
      3 => clienttranslate('3rd Ballad'),
    ];
    $eventNumberMap = [
      0 => clienttranslate('Royal Inspection Round'),
      1 => clienttranslate('1st Event'),
      2 => clienttranslate('2nd Event'),
      3 => clienttranslate('3rd Event'),
      4 => clienttranslate('4th Event'),
      5 => clienttranslate('5th Event'),
      6 => clienttranslate('6th Event'),
      7 => clienttranslate('7th Event'),
      8 => clienttranslate('Royal Inspection Round'),
    ];

    self::notifyAll('startOfRound', clienttranslate('${balladNumberText}, ${eventNumberText}'), [
      'balladNumberText' => $balladNumberMap[$balladNumber],
      'eventNumberText' => $eventNumberMap[$eventNumber],
      'balladNumber' => $balladNumber,
      'eventNumber' => $eventNumber,
      'i18n' => ['balladNumberText', 'eventNumberText'],
    ]);
  }

  public static function greatEscapeLight($player, $forces, $moves, $space)
  {
    $text = clienttranslate('${player_name} places Robin Hood and all Merry Men from Prison in ${tkn_boldText_spaceName}');

    self::notify($player, 'moveMerryMenPrivate', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'forces' => $forces,
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_spaceName']
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'moves' => $moves,
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_spaceName'],
      'preserve' => ['playerId'],
    ]);
  }

  public static function robCaptureRobbingMerryMen($player, $forces, $moves)
  {
    $text = clienttranslate('The Robbing Merry Men are captured');

    self::notify($player, 'moveMerryMenPrivate', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'forces' => $forces,
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'moves' => $moves,
      'preserve' => ['playerId'],
    ]);
  }

  public static function robThePotterDarkSuccess($player, $forces, $moves, $space)
  {
    $text = clienttranslate('${player_name} places Robin Hood in ${tkn_boldText_spaceName}');

    self::notify($player, 'moveMerryMenPrivate', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'forces' => $forces,
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_spaceName'],
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'moves' => $moves,
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_spaceName'],
      'preserve' => ['playerId'],
    ]);
  }

  public static function robThePotterDarkFail($player, $forces, $moves)
  {
    $text = clienttranslate('${player_name} Captures Robin Hood');

    $sheriff = Players::getSheriffPlayer();
    self::notify($player, 'moveMerryMenPrivate', $text, [
      'playerId' => $player->getId(),
      'player_name' => $sheriff->getName(),
      'forces' => $forces,
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'playerId' => $player->getId(),
      'player_name' => $sheriff->getName(),
      'moves' => $moves,
    ]);
  }

  public static function royalPardonLight($player,  $forces, $moves, $space)
  {
    $text = clienttranslate('${player_name} moves ${count} Merry Men from Prison to ${tkn_boldText_spaceName}');

    self::notify($player, 'moveMerryMenPrivate', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'forces' => $forces,
      'count' => count($forces),
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_spaceName']
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'moves' => $moves,
      'count' => count($forces),
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_spaceName'],
      'preserve' => ['playerId'],
    ]);
  }

  public static function maidMarianDark($player, $forces, $moves, $fromSpace, $toSpace)
  {
    $text = clienttranslate('${player_name} moves Merry Men from ${tkn_boldText_spaceFrom} to ${tkn_boldText_spaceTo}');
    $robinHoodPlayer = Players::getRobinHoodPlayer();

    self::notify($robinHoodPlayer, 'moveMerryMenPrivate', $text, [
      'playerId' => $robinHoodPlayer->getId(),
      'player_name' => $player->getName(),
      'forces' => $forces,
      'tkn_boldText_spaceFrom' => $fromSpace->getName(),
      'tkn_boldText_spaceTo' => $toSpace->getName(),
      'i18n' => ['tkn_boldText_spaceFrom', 'tkn_boldText_spaceTo']
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'playerId' => $robinHoodPlayer->getId(),
      'player_name' => $player->getName(),
      'moves' => $moves,
      'tkn_boldText_spaceFrom' => $fromSpace->getName(),
      'tkn_boldText_spaceTo' => $toSpace->getName(),
      'i18n' => ['tkn_boldText_spaceFrom', 'tkn_boldText_spaceTo'],
      'preserve' => ['playerId']
    ]);
  }

  public static function willStutelyDark($player, $forces, $moves)
  {
    $text = clienttranslate('${player_name} places ${count} Merry Men in Prison');
    $robinHoodPlayer = Players::getRobinHoodPlayer();

    self::notify($robinHoodPlayer, 'moveMerryMenPrivate', $text, [
      'playerId' => $robinHoodPlayer->getId(),
      'player_name' => $player->getName(),
      'forces' => $forces,
      'count' => count($forces),
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'playerId' => $robinHoodPlayer->getId(),
      'player_name' => $player->getName(),
      'moves' => $moves,
      'count' => count($forces),
      'preserve' => ['playerId']
    ]);
  }

  public static function willStutelyLight($player, $forces, $moves, $parish)
  {
    $text = clienttranslate('${player_name} moves a Merry Man to ${tkn_boldText_spaceName}');

    self::notify($player, 'moveMerryMenPrivate', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'forces' => $forces,
      'i18n' => ['tkn_boldText_spaceName'],
      'tkn_boldText_spaceName' => $parish->getName(),
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'playerId' => $player->getId(),
      'player_name' => $player->getName(),
      'moves' => $moves,
      'i18n' => ['tkn_boldText_spaceName'],
      'tkn_boldText_spaceName' => $parish->getName(),
      'preserve' => ['playerId']
    ]);
  }

  public static function putCardInVictimsPile($player, $card, $fromLocation = null)
  {
    $text = clienttranslate('${player_name} puts ${tkn_cardName} in the Victims Pile');

    if ($fromLocation !== null) {
      $textMap = [
        TRAVELLERS_DECK => clienttranslate('${player_name} removes ${tkn_cardName} from the Traveller Deck to the Victims Pile ${tkn_card}'),
        TRAVELLERS_DISCARD => clienttranslate('${player_name} removes ${tkn_cardName} from the discard pile to the Victims Pile ${tkn_card}'),
      ];
      $text = $textMap[$fromLocation];
    }

    self::notifyAll("putCardInVictimsPile", $text, [
      'player' => $player,
      'card' => $card,
      'fromLocation' => $fromLocation,
      'tkn_cardName' => self::tknCardNameArg($card),
      'tkn_card' => self::tknCardArg($card),
    ]);
  }

  public static function putTravellerInDiscardPile($player, $card)
  {
    $text = clienttranslate('${player_name} puts ${tkn_cardName} in the discard pile ${tkn_card}');

    self::notifyAll("putTravellerInDiscardPile", $text, [
      'player' => $player,
      'card' => $card,
      'tkn_cardName' => self::tknCardNameArg($card),
      'tkn_card' => self::tknCardArg($card),
    ]);
  }

  public static function recruitMerryMen($player, $originalNumber, $robinHood, $merryMenToPlace, $space)
  {
    $textPublic = $originalNumber === 1 ?
      clienttranslate('${player_name} places ${number} Merry Man in ${tkn_boldText_spaceName}') :
      clienttranslate('${player_name} places ${number} Merry Men in ${tkn_boldText_spaceName}');

    $publicTextArgs = [
      'tkn_boldText_spaceName' => $space->getName(),
      'number' => $originalNumber,
    ];


    $privateMerryMenToPlace = count($merryMenToPlace);

    $textPrivateSingle = clienttranslate('Private: ${player_name} places ${number} Merry Man in ${tkn_boldText_spaceName}');
    $textPrivateMultiple = clienttranslate('Private: ${player_name} places ${number} Merry Men in ${tkn_boldText_spaceName}');
    $textPrivateRobinHood = clienttranslate('Private: ${player_name} places Robin Hood in ${tkn_boldText_spaceName}');
    $textPrivateRobinHoodAndMerryMan = clienttranslate('Private: ${player_name} places Robin Hood and ${number} Merry Man in ${tkn_boldText_spaceName}');

    $textPrivate = $textPrivateSingle;
    if ($privateMerryMenToPlace === 2) {
      $textPrivate = $textPrivateMultiple;
    } else if ($robinHood !== null && $privateMerryMenToPlace === 0) {
      $textPrivate = $textPrivateRobinHood;
    } else if ($robinHood !== null && $privateMerryMenToPlace === 1) {
      $textPrivate = $textPrivateRobinHoodAndMerryMan;
    }

    $privateTextArgs = [
      'tkn_boldText_spaceName' => $space->getName(),
      'number' => $privateMerryMenToPlace,
    ];

    self::placeMerryMen($player, $robinHood, $merryMenToPlace, $textPublic, $textPrivate, $publicTextArgs, $privateTextArgs);
  }

  public static function removeCardFromGame($player, $card, $fromLocation = null)
  {
    $text = clienttranslate('${player_name} removes ${tkn_cardName} from the game');

    if ($fromLocation !== null) {
      $textMap = [
        TRAVELLER_ROBBED => clienttranslate('${player_name} removes ${tkn_cardName} from the game ${tkn_card}'),
        TRAVELLERS_DECK => clienttranslate('${player_name} removes ${tkn_cardName} from the Travellers Deck from the game ${tkn_card}'),
        TRAVELLERS_DISCARD => clienttranslate('${player_name} removes ${tkn_cardName} from the discard pile from the game ${tkn_card}'),
      ];
      $text = $textMap[$fromLocation];
    }

    self::notifyAll("removeCardFromGame", $text, [
      'player' => $player,
      'card' => $card,
      'tkn_cardName' => self::tknCardNameArg($card),
      'tkn_card' => self::tknCardArg($card),
    ]);
  }

  public static function removeForceFromGame($player, $force, $space, $isHidden, $fromPrison = false)
  {
    $actingPlayer = ($force->isMerryMan() || $force->isCamp()) && !$player->isRobinHood() ? Players::getRobinHoodPlayer() : $player;

    self::notify($actingPlayer, 'removeForceFromGamePrivate', clienttranslate('${player_name} removes ${tkn_boldText_forceName} from ${tkn_boldText_spaceName} from the game'), [
      'player' => $actingPlayer,
      'you' => '${you}',
      'force' => $force,
      'spaceId' => $fromPrison ? PRISON : $space->getId(),
      'tkn_boldText_forceName' => $force->getName(),
      'tkn_boldText_spaceName' => $fromPrison ? clienttranslate('Prison') : $space->getName(),
      'i18n' => ['tkn_boldText_forceName', 'tkn_boldText_spaceName']
    ]);

    self::notifyAll('removeForceFromGamePublic', clienttranslate('${player_name} removes ${tkn_boldText_forceName} from ${tkn_boldText_spaceName} from the game'), [
      'player' => $actingPlayer,
      'force' => [
        'type' => $isHidden ? $force->getPublicType() : $force->getType(),
        'hidden' => $isHidden,
      ],
      'spaceId' => $fromPrison ? PRISON : $space->getId(),
      'tkn_boldText_forceName' => $force->getPublicName(),
      'tkn_boldText_spaceName' => $fromPrison ? clienttranslate('Prison') : $space->getName(),
      'i18n' => ['tkn_boldText_forceName', 'tkn_boldText_spaceName'],
      'preserve' => ['playerId'],
    ]);
  }

  public static function returnHenchmanSupply($player, $force, $space)
  {
    self::notifyAll('returnToSupplyPrivate', clienttranslate('${player_name} returns ${tkn_boldText_forceName} from ${tkn_boldText_spaceName} to Available Forces'), [
      'player' => $player,
      'force' => $force,
      'spaceId' => $space->getId(),
      'tkn_boldText_forceName' => $force->getName(),
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_forceName', 'tkn_boldText_spaceName']
    ]);
  }

  public static function returnToSupply($player, $force, $space, $isHidden, $fromPrison = false)
  {
    $actingPlayer = ($force->isMerryMan() || $force->isCamp()) && !$player->isRobinHood() ? Players::getRobinHoodPlayer() : $player;

    self::notify($actingPlayer, 'returnToSupplyPrivate', clienttranslate('${player_name} returns ${tkn_boldText_forceName} from ${tkn_boldText_spaceName} to Available Forces'), [
      'player' => $actingPlayer,
      'force' => $force,
      'spaceId' => $fromPrison ? PRISON : $space->getId(),
      'tkn_boldText_forceName' => $force->getName(),
      'tkn_boldText_spaceName' => $fromPrison ? clienttranslate('Prison') : $space->getName(),
      'i18n' => ['tkn_boldText_forceName', 'tkn_boldText_spaceName']
    ]);

    self::notifyAll('returnToSupplyPublic', clienttranslate('${player_name} returns ${tkn_boldText_forceName} from ${tkn_boldText_spaceName} to Available Forces'), [
      'player' => $actingPlayer,
      'force' => [
        'type' => $isHidden ? $force->getPublicType() : $force->getType(),
        'hidden' => $isHidden,
      ],
      'spaceId' => $fromPrison ? PRISON : $space->getId(),
      'tkn_boldText_forceName' => $force->getPublicName(),
      'tkn_boldText_spaceName' => $fromPrison ? clienttranslate('Prison') : $space->getName(),
      'i18n' => ['tkn_boldText_forceName', 'tkn_boldText_spaceName'],
      'preserve' => ['playerId']
    ]);
  }

  public static function resolveEventEffect($player, $card, $effect)
  {
    self::message(clienttranslate('${player_name} choosed to execute ${tkn_boldText_effectName}'), [
      'player' => $player,
      'tkn_boldText_effectName' => $effect === 'dark' ? $card->getTitleDark() : $card->getTitleLight(),
      'i18n' => ['tkn_boldText_effectName']
    ]);
  }

  public static function removeSubmissiveMarker($player, $space)
  {
    self::notifyAll("parishStatus", clienttranslate('${player_name} removes the Submissive marker from ${tkn_boldText_parishName} from the game'), [
      'player' => $player,
      'tkn_boldText_parishName' => $space->getName(),
      'spaceId' => $space->getId(),
      'status' => PASSIVE,
      'i18n' => ['tkn_boldText_parishName']
    ]);
  }

  public static function parishStatus($player, $space, $status)
  {
    $statusNameMap = [
      PASSIVE => clienttranslate('Passive'),
      REVOLTING => clienttranslate('Revolting'),
      SUBMISSIVE => clienttranslate('Submissive'),
    ];

    self::notifyAll("parishStatus", clienttranslate('${player_name} sets ${tkn_boldText_parishName} to ${tkn_boldText_status}'), [
      'player' => $player,
      'tkn_boldText_parishName' => $space->getName(),
      'tkn_boldText_status' => $statusNameMap[$status],
      'spaceId' => $space->getId(),
      'status' => $status,
      'i18n' => ['tkn_boldText_parishName', 'tkn_boldText_status']
    ]);
  }

  public static function redeploymentSheriff($player, $forces, $carriages)
  {
    self::notifyAll("redeploymentSheriff", clienttranslate('${player_name} redeploys their Henchmen and returns all used Carriages to Available Forces'), [
      'player' => $player,
      'forces' => $forces,
      'numberOfCarriages' => count($carriages),
      'isTemporaryTruce' => false,
    ]);
  }

  public static function temporaryTruceSheriff($player, $forces)
  {
    self::notifyAll("redeploymentSheriff", clienttranslate('${player_name} moves all Henchmen to Submissive spaces'), [
      'player' => $player,
      'forces' => $forces,
      'isTemporaryTruce' => true,
    ]);
  }


  public static function redeploymentRobinHood($player, $forces, $moves, $isTemporaryTruce)
  {
    $text = $isTemporaryTruce ? clienttranslate('${player_name} moves all Merry Men to Camps or Forests') :  clienttranslate('${player_name} redeploys their Merry Men');

    self::notify($player, 'moveMerryMenPrivate', $text, [
      'player' => $player,
      'count' => count($moves),
      'forces' => $forces,
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'player' => $player,
      'moves' => $moves,
      'preserve' => ['playerId']
    ]);
  }

  public static function resolveRobEffect($player, $effectTitle)
  {
    self::message(clienttranslate('${player_name} resolved ${tkn_boldText_effect}'), [
      'player' => $player,
      'tkn_boldText_effect' => $effectTitle,
      'i18n' => ['tkn_boldText_effect']
    ]);
  }

  public static function robTakeShillingsFromTheSheriff($player, $sheriffPlayer, $amount)
  {
    self::notifyAll('robTakeTwoShillingsFromTheSheriff', clienttranslate('${player_name} takes ${amount} Shillings from ${player_name2}'), [
      'player' => $player,
      'player_name2' => $sheriffPlayer->getName(),
      'sheriffPlayerId' => $sheriffPlayer->getId(),
      'amount' => $amount
    ]);
  }

  public static function robTargetCarriage($player, $space)
  {
    self::message(clienttranslate('${player_name} robs a Carriage in ${tkn_boldText_space}'), [
      'player' => $player,
      'tkn_boldText_space' => $space->getName(),
      'i18n' => ['tkn_boldText_space'],
    ]);
  }

  public static function robTargetSheriffsTreasury($player)
  {
    self::message(clienttranslate('${player_name} robs the Sheriff\'s Treasury'), [
      'player' => $player,
    ]);
  }

  public static function returnTravellersDiscardToMainDeck($cards)
  {
    self::notifyAll("returnTravellersDiscardToMainDeck", clienttranslate('The Traveller deck discard pile is shuffled into the main deck'), [
      'cards' => $cards,
    ]);
  }

  public static function robResult($player, $dieColor, $dieResult, $success)
  {
    $text = $success ?
      clienttranslate('${player_name} rolls ${tkn_dieResult} : the Rob attempt is a success') :
      clienttranslate('${player_name} rolls ${tkn_dieResult} : the Rob attempt fails');

    self::message($text, [
      'player' => $player,
      'tkn_dieResult' => self::tknDieResultArg($dieColor, $dieResult),
    ]);
  }

  public static function royalInspectionUnrestPhase($marker)
  {
    self::notifyAll("moveRoyalInspectionMarker", clienttranslate('Royal Inspection Round'), [
      'marker' => $marker->jsonSerialize(),
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

  public static function selectedPlot($player, $plotName)
  {
    // $count = count($targetSpaces);
    // $spacesLog = clienttranslate('${tkn_boldText_space0}');
    // if ($count === 2) {
    //   $spacesLog = clienttranslate('${tkn_boldText_space0} and ${tkn_boldText_space1}');
    // } else if ($count === 3) {
    //   $spacesLog = clienttranslate('${tkn_boldText_space0}, ${tkn_boldText_space1} and ${tkn_boldText_space2}');
    // }
    // $spacesArgs = [
    //   'i18n' => [],
    // ];
    // foreach ($targetSpaces as $index => $space) {
    //   $spacesArgs['tkn_boldText_space' . $index] = $space->getName();
    // }

    self::message(clienttranslate('${player_name} chooses to perform ${tkn_boldText_plotName} Plot'), [
      'player' => $player,
      'tkn_boldText_plotName' => $plotName,
      // 'spacesLog' => [
      //   'log' => $spacesLog,
      //   'args' => $spacesArgs,
      // ],
      'i18n' => ['tkn_boldText_plotName']
    ]);
  }

  public static function extraOption($player, $extraOptionId)
  {
    $textMap = [
      GAIN_TWO_SHILLINGS => clienttranslate('${player_name} chooses to gain 2 Shillings')
    ];

    self::message($textMap[$extraOptionId], [
      'player' => $player,
    ]);
  }

  public static function selectedTravellerOption($player, $card, $option)
  {
    self::message(clienttranslate('${player_name} selects ${tkn_boldText_optionTitle}'), [
      'player' => $player,
      'tkn_boldText_optionTitle' => $option === 'light' ? $card->getTitleLight() : $card->getTitleDark(),
      'i18n' => ['tkn_boldText_optionTitle']
    ]);
  }

  public static function setupRobinHood($player, $robinHood, $merryMen)
  {
    $textPublic = clienttranslate('${player_name} places Forces');
    $textPrivate = clienttranslate('Private: ${player_name} places forces');
    self::placeMerryMen($player, $robinHood, $merryMen, $textPublic, $textPrivate);
  }

  public static function shuffleTravellersDeck($player)
  {
    self::message(clienttranslate('${player_name} shuffles the Travellers Deck'), [
      'player' => $player,
    ]);
  }

  public static function sneakMerryMen($player, $forces, $moves, $fromSpace)
  {
    $text = clienttranslate('${player_name} sneaks ${count} Merry Men from ${tkn_boldText_fromSpace}');


    self::notify($player, 'moveMerryMenPrivate', $text, [
      'player' => $player,
      'count' => count($moves),
      'forces' => $forces,
      'tkn_boldText_fromSpace' => $fromSpace->getName(),
      'i18n' => ['tkn_boldText_fromSpace']
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'player' => $player,
      'moves' => $moves,
      'count' => count($moves),
      'tkn_boldText_fromSpace' => $fromSpace->getName(),
      'i18n' => ['tkn_boldText_fromSpace'],
      'preserve' => ['playerId']
    ]);
  }

  // public static function sneakMerryMen($player, $merryMen, $moves, $fromSpace, $toSpace)
  // {
  //   self::notify($player, 'sneakMerryMenPrivate', clienttranslate('${player_name} moves ${count} Merry Men from ${tkn_boldText_fromSpace} to ${tkn_boldText_toSpace}'), [
  //     'player' => $player,
  //     'count' => count($merryMen),
  //     'forces' => $merryMen,
  //     'fromSpaceId' => $fromSpace->getId(),
  //     'toSpaceId' => $toSpace->getId(),
  //     'tkn_boldText_fromSpace' => $fromSpace->getName(),
  //     'tkn_boldText_toSpace' => $toSpace->getName(),
  //     'i18n' => ['tkn_boldText_fromSpace', 'tkn_boldText_toSpace']
  //   ]);


  //   self::notifyAll('sneakMerryMen', clienttranslate('${player_name} moves ${count} Merry Men from ${tkn_boldText_fromSpace} to ${tkn_boldText_toSpace}'), [
  //     'player' => $player,
  //     'moves' => $moves,
  //     'fromSpaceId' => $fromSpace->getId(),
  //     'toSpaceId' => $toSpace->getId(),
  //     'tkn_boldText_fromSpace' => $fromSpace->getName(),
  //     'tkn_boldText_toSpace' => $toSpace->getName(),
  //     'count' => count($merryMen),
  //     'i18n' => ['tkn_boldText_fromSpace', 'tkn_boldText_toSpace']
  //   ]);
  // }

  public static function swashbuckleMoves($player, $forces, $moves, $fromSpace)
  {
    $text = count($moves) === 1 ?
      clienttranslate('${player_name} moves ${count} Merry Man from ${tkn_boldText_fromSpace} to ${tkn_boldText_toSpace1}') :
      clienttranslate('${player_name} moves ${count} Merry Men from ${tkn_boldText_fromSpace} to ${tkn_boldText_toSpace1} and ${tkn_boldText_toSpace2}');

    $textArgs = [
      'count' => count($moves),
      'tkn_boldText_fromSpace' => $fromSpace === PRISON ? clienttranslate('Prison') : $fromSpace->getName(),
      'tkn_boldText_toSpace1' => Spaces::get($moves[0]['to']['spaceId'])->getName(),
      'tkn_boldText_toSpace2' => count($moves) === 2 ? Spaces::get($moves[1]['to']['spaceId'])->getName() : '',
      'i18n' => ['tkn_boldText_fromSpace', 'tkn_boldText_toSpace1', 'tkn_boldText_toSpace2']
    ];

    self::notify($player, 'moveMerryMenPrivate', $text, array_merge([
      'player' => $player,
      'forces' => $forces,
    ], $textArgs));

    self::notifyAll('moveMerryMenPublic', $text, array_merge([
      'player' => $player,
      'moves' => $moves,
      'preserve' => ['playerId']
    ], $textArgs));
  }

  public static function swapRobinHood($player, $forces)
  {
    if (count($forces) > 0) {
      self::notify($player, 'moveMerryMenPrivate', '', [
        'player' => $player,
        'forces' => $forces,
      ]);
    }

    self::message(clienttranslate('${player_name} may have secretly swapped Robin Hood with another Merry Man on the map'), [
      'player' => $player,
    ]);
  }

  public static function swapRobinHoodGuyOfGisborne($player, $forces, $moves, $space)
  {
    $text = clienttranslate('${player_name} swaps Robin Hood with a Merry Man in ${tkn_boldText_spaceName}');

    self::notify($player, 'moveMerryMenPrivate', $text, [
      'player' => $player,
      'forces' => $forces,
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_spaceName']
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'player' => $player,
      'moves' => $moves,
      'tkn_boldText_spaceName' => $space->getName(),
      'i18n' => ['tkn_boldText_spaceName'],
      'preserve' => ['playerId']
    ]);
  }

  public static function taxCollectorsLight($player, $forces, $moves)
  {
    $text = clienttranslate('${player_name} moves ${count} Merry Men from adjacent spaces into ${tkn_boldText_spaceName}');
    $spaceName = Spaces::get(NOTTINGHAM)->getName();

    self::notify($player, 'moveMerryMenPrivate', $text, [
      'player' => $player,
      'forces' => $forces,
      'tkn_boldText_spaceName' => $spaceName,
      'i18n' => ['tkn_boldText_spaceName'],
      'count' => count($forces),
    ]);

    self::notifyAll('moveMerryMenPublic', $text, [
      'player' => $player,
      'moves' => $moves,
      'tkn_boldText_spaceName' => $spaceName,
      'count' => count($forces),
      'i18n' => ['tkn_boldText_spaceName'],
      'preserve' => ['playerId']
    ]);
  }

  public static function unableToRevealRobinHood($player)
  {
    self::message(clienttranslate('${player_name} is not able to reveal Robin Hood'), [
      'player' => $player,
    ]);
  }
}
