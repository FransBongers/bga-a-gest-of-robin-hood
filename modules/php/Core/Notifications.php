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

    self::notify(Players::getRobinHoodPlayer(), 'refreshForcesPrivate', '', [
      'forces' => $forces[ROBIN_HOOD]
    ]);
    self::notify(Players::getSheriffPlayer(), 'refreshForcesPrivate', '', [
      'forces' => $forces[SHERIFF]
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

  protected static function tknCardNameArg($card)
  {
    return explode('_', $card->getId())[0] . ':' . $card->getTitle();
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

  public static function drawAndRevealCard($card)
  {
    self::notifyAll("drawAndRevealCard", clienttranslate('A new card is drawn from the Event deck: ${tkn_boldText_cardTitle}'), [
      'card' => $card,
      'tkn_boldText_cardTitle' => $card->getTitle(),
    ]);
  }

  public static function drawAndRevealTravellerCard($player, $card)
  {
    self::notifyAll("drawAndRevealTravellerCard", clienttranslate('${player_name} draws the top card of the Travellers deck: ${tkn_cardName}'), [
      'player' => $player,
      'card' => $card,
      'tkn_cardName' => self::tknCardNameArg($card),
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

  public static function moveCarriageToUsedCarriages($player, $carriage, $nottingham)
  {
    // self::notifyAll('moveCarriagePublic', clienttranslate('${player_name} moves a Carriage to ${tkn_boldText_used}'), [
    //   'player' => $player,
    //   'tkn_boldText_used' => clienttranslate('Used Carriages'),
    //   'carriage' => $carriage->jsonSerialize(),
    //   'toSpaceId' => $carriage->getLocation(),
    //   'fromSpaceId' => $fromSpaceId,
    //   'i18n' => ['tkn_boldText_used'],
    // ]);
    $text = clienttranslate('${player_name} moves a Carriage to ${tkn_boldText_to}');

    self::notify($player, 'moveCarriagePrivate', $text, [
      'player' => $player,
      'tkn_boldText_from' => $nottingham->getName(),
      'tkn_boldText_to' => clienttranslate('Used Carriages'),
      'carriage' => $carriage->jsonSerialize(),
      'toSpaceId' => $carriage->getLocation(),
      'i18n' => ['tkn_boldText_from', 'tkn_boldText_to'],
    ]);

    self::notifyAll('moveCarriagePublic', $text, [
      'player' => $player,
      'tkn_boldText_from' => $nottingham->getName(),
      'tkn_boldText_to' => clienttranslate('Used Carriages'),
      'carriage' => [
        'hidden' => false,
        'type' => $carriage->getType(),
      ],
      'toSpaceId' => $carriage->getLocation(),
      'fromSpaceId' => NOTTINGHAM,
      'i18n' => ['tkn_boldText_from', 'tkn_boldText_to'],
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
      'i18n' => ['tkn_boldText_forceName', 'tkn_boldText_spaceName']
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
      // 'you' => '${you}',
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

    self::notifyAll("placeMerryMen", $textPublic, array_merge($publicTextArgs, [
      'player' => $player,
      'merryMenCounts' => $merryMenCounts,
    ]));
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

  public static function returnToSupply($player, $force, $space, $isHidden)
  {
    self::notify($player, 'returnToSupplyPrivate', clienttranslate('${player_name} returns ${tkn_boldText_forceName} from ${tkn_boldText_spaceName} to Available Forces'), [
      'player' => $player,
      'you' => '${you}',
      'force' => $force,
      'spaceId' => $space->getId(),
      'tkn_boldText_forceName' => $force->getName(),
      'tkn_boldText_spaceName' => $space->getName(),
    ]);

    self::notifyAll('returnToSupply', clienttranslate('${player_name} returns ${tkn_boldText_forceName} from ${tkn_boldText_spaceName} to Available Forces'), [
      'player' => $player,
      'force' => [
        'type' => $isHidden ? $force->getPublicType() : $force->getType(),
        'hidden' => $isHidden,
      ],
      'spaceId' => $space->getId(),
      'tkn_boldText_forceName' => $force->getPublicName(),
      'tkn_boldText_spaceName' => $space->getName(),
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

  public static function setupRobinHood($player, $robinHood, $merryMen)
  {
    $textPublic = clienttranslate('${player_name} places Forces');
    $textPrivate = clienttranslate('Private: ${player_name} places forces');
    self::placeMerryMen($player, $robinHood, $merryMen, $textPublic, $textPrivate);
  }

  public static function sneakMerryMen($player, $merryMen, $moves, $fromSpace, $toSpace)
  {
    self::notify($player, 'sneakMerryMenPrivate', clienttranslate('${player_name} moves ${count} Merry Men from ${tkn_boldText_fromSpace} to ${tkn_boldText_toSpace}'), [
      'player' => $player,
      'count' => count($merryMen),
      'forces' => $merryMen,
      'fromSpaceId' => $fromSpace->getId(),
      'toSpaceId' => $toSpace->getId(),
      'tkn_boldText_fromSpace' => $fromSpace->getName(),
      'tkn_boldText_toSpace' => $toSpace->getName(),
      'i18n' => ['tkn_boldText_fromSpace', 'tkn_boldText_toSpace']
    ]);


    self::notifyAll('sneakMerryMen', clienttranslate('${player_name} moves ${count} Merry Men from ${tkn_boldText_fromSpace} to ${tkn_boldText_toSpace}'), [
      'player' => $player,
      'moves' => $moves,
      'fromSpaceId' => $fromSpace->getId(),
      'toSpaceId' => $toSpace->getId(),
      'tkn_boldText_fromSpace' => $fromSpace->getName(),
      'tkn_boldText_toSpace' => $toSpace->getName(),
      'count' => count($merryMen),
      'i18n' => ['tkn_boldText_fromSpace', 'tkn_boldText_toSpace']
    ]);
  }
}
