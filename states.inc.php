<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * agestofrobinhood implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * agestofrobinhood game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

require_once 'modules/php/constants.inc.php';


$machinestates = array(

    // The initial state. Please do not modify.
    ST_GAME_SETUP => [
        "name" => ST_GAME_SETUP_NAME,
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => ["" => ST_BEFORE_START_OF_TURN]
    ],

    ST_GENERIC_NEXT_PLAYER => [
        'name' => 'genericNextPlayer',
        'type' => 'game',
    ],
    // Note: ID=2 => your first state

    2 => array(
        "name" => "playerTurn",
        "description" => clienttranslate('${actplayer} must end the game or pass'),
        "descriptionmyturn" => clienttranslate('${you} must end the game or pass'),
        "type" => "activeplayer",
        "possibleactions" => array("playCard", "passTurn", "endGame"),
        "transitions" => [
            'playerTurn' => 2,
            'endGame' => ST_END_GAME
        ]
    ),

    // .########.##.....##.########..##....##
    // ....##....##.....##.##.....##.###...##
    // ....##....##.....##.##.....##.####..##
    // ....##....##.....##.########..##.##.##
    // ....##....##.....##.##...##...##..####
    // ....##....##.....##.##....##..##...###
    // ....##.....#######..##.....##.##....##

    ST_BEFORE_START_OF_TURN => [
        'name' => 'beforeStartOfTurn',
        'description' => '',
        'type' => 'game',
        'action' => 'stBeforeStartOfTurn',
    ],

    ST_TURNACTION => [
        'name' => 'turnAction',
        'description' => '',
        'type' => 'game',
        'action' => 'stTurnAction',
        'transitions' => [
            'done' => ST_CLEANUP,
        ],
        'updateGameProgression' => true,
    ],

    // .########.##....##..######...####.##....##.########
    // .##.......###...##.##....##...##..###...##.##......
    // .##.......####..##.##.........##..####..##.##......
    // .######...##.##.##.##...####..##..##.##.##.######..
    // .##.......##..####.##....##...##..##..####.##......
    // .##.......##...###.##....##...##..##...###.##......
    // .########.##....##..######...####.##....##.########

    ST_RESOLVE_STACK => [
        'name' => 'resolveStack',
        'type' => 'game',
        'action' => 'stResolveStack',
        'transitions' => [],
    ],

    ST_CONFIRM_TURN => [
        'name' => 'confirmTurn',
        'description' => clienttranslate('${actplayer} must confirm or restart their turn'),
        'descriptionmyturn' => clienttranslate('${you} must confirm or restart your turn'),
        'type' => 'activeplayer',
        'args' => 'argsConfirmTurn',
        'action' => 'stConfirmTurn',
        'possibleactions' => ['actConfirmTurn', 'actRestart'],
        'transitions' => [
            // 'breakStart' => ST_BREAK_MULTIACTIVE
        ],
    ],

    ST_CONFIRM_PARTIAL_TURN => [
        'name' => 'confirmPartialTurn',
        'description' => clienttranslate('${actplayer} must confirm the switch of player'),
        'descriptionmyturn' => clienttranslate('${you} must confirm the switch of player. You will not be able to restart turn'),
        'type' => 'activeplayer',
        'args' => 'argsConfirmTurn',
        // 'action' => 'stConfirmPartialTurn',
        'possibleactions' => ['actConfirmPartialTurn', 'actRestart'],
    ],

    // .########.##....##.########......#######..########
    // .##.......###...##.##.....##....##.....##.##......
    // .##.......####..##.##.....##....##.....##.##......
    // .######...##.##.##.##.....##....##.....##.######..
    // .##.......##..####.##.....##....##.....##.##......
    // .##.......##...###.##.....##....##.....##.##......
    // .########.##....##.########......#######..##......

    // ..######......###....##.....##.########
    // .##....##....##.##...###...###.##......
    // .##.........##...##..####.####.##......
    // .##...####.##.....##.##.###.##.######..
    // .##....##..#########.##.....##.##......
    // .##....##..##.....##.##.....##.##......
    // ..######...##.....##.##.....##.########

    ST_PRE_END_GAME => [
        'name' => 'preEndGame',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    ST_END_GAME => [
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    ],

    // ....###....########..#######..##.....##.####..######.
    // ...##.##......##....##.....##.###...###..##..##....##
    // ..##...##.....##....##.....##.####.####..##..##......
    // .##.....##....##....##.....##.##.###.##..##..##......
    // .#########....##....##.....##.##.....##..##..##......
    // .##.....##....##....##.....##.##.....##..##..##....##
    // .##.....##....##.....#######..##.....##.####..######.

    // ....###.....######..########.####..#######..##....##..######.
    // ...##.##...##....##....##.....##..##.....##.###...##.##....##
    // ..##...##..##..........##.....##..##.....##.####..##.##......
    // .##.....##.##..........##.....##..##.....##.##.##.##..######.
    // .#########.##..........##.....##..##.....##.##..####.......##
    // .##.....##.##....##....##.....##..##.....##.##...###.##....##
    // .##.....##..######.....##....####..#######..##....##..######.

    ST_CHOOSE_ACTION => [
        'name' => 'chooseAction',
        'description' => clienttranslate('${actplayer} must choose an action'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actChooseAction', 'actPassOptionalAction', 'actRestart'],
    ],

    ST_START_OF_ROUND => [
        'name' => 'startOfRound',
        'type' => 'game',
        'action' => 'stStartOfRound',
        'transitions' => [],
    ],

    ST_END_OF_ROUND => [
        'name' => 'endOfRound',
        'type' => 'game',
        'action' => 'stEndOfRound',
        "transitions" => ["startOfRound" => ST_START_OF_ROUND]
    ],


    ST_MOVE_CARRIAGE => [
        'name' => 'moveCarriage',
        'description' => clienttranslate('${actplayer} must move a Carriage'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actMoveCarriage', 'actPassOptionalAction', 'actRestart'],
    ],

    ST_PLAYER_ACTION => [
        'name' => 'playerAction',
        'description' => clienttranslate('${actplayer} may perform actions'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actPlayerAction', 'actPassOptionalAction', 'actRestart'],
    ],


    ST_RECRUIT => [
        'name' => 'recruit',
        'description' => clienttranslate('${actplayer} may Recruit'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actRecruit', 'actPassOptionalAction', 'actRestart'],
    ],

    ST_ROB => [
        'name' => 'rob',
        'description' => clienttranslate('${actplayer} may Rob'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actRob', 'actPassOptionalAction', 'actRestart'],
    ],

    ST_SELECT_PLOT => [
        'name' => 'selectPlot',
        'description' => clienttranslate('${actplayer} must select a Plot or pass'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actSelectPlot', 'actPassOptionalAction', 'actRestart'],
    ],

    ST_SELECT_DEED => [
        'name' => 'selectDeed',
        'description' => clienttranslate('${actplayer} may select a Deed'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actSelectDeed', 'actPassOptionalAction', 'actRestart'],
    ],

    ST_SETUP_ROBIN_HOOD => [
        'name' => 'setupRobinHood',
        'description' => clienttranslate('${actplayer} must perform Robin Hood setup'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actSetupRobinHood', 'actPassOptionalAction', 'actRestart'],
    ],

    ST_SNEAK => [
        'name' => 'sneak',
        'description' => clienttranslate('${actplayer} may Sneak'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actSneak', 'actPassOptionalAction', 'actRestart'],
    ],

    ST_TURNCOAT => [
        'name' => 'turncoat',
        'description' => clienttranslate('${actplayer} may Turncoat'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actTurncoat', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_DONATE => [
        'name' => 'donate',
        'description' => clienttranslate('${actplayer} may donate'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actDonate', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_SWASHBUCKLE => [
        'name' => 'swashbuckle',
        'description' => clienttranslate('${actplayer} may Swashbuckle'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actSwashbuckle', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_INSPIRE => [
        'name' => 'inspire',
        'description' => clienttranslate('${actplayer} may Inspire'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        // 'transitions' => [],
        'possibleactions' => ['actInspire', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_RIDE => [
        'name' => 'ride',
        'description' => clienttranslate('${actplayer} may Ride'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actRide', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_CONFISCATE => [
        'name' => 'confiscate',
        'description' => clienttranslate('${actplayer} may Confiscate'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actConfiscate', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_DISPERSE => [
        'name' => 'disperse',
        'description' => clienttranslate('${actplayer} may Disperse'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actDisperse', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_HIRE => [
        'name' => 'hire',
        'description' => clienttranslate('${actplayer} may Hire'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actHire', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_PATROL => [
        'name' => 'patrol',
        'description' => clienttranslate('${actplayer} may Patrol'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actPatrol', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_CAPTURE => [
        'name' => 'capture',
        'description' => clienttranslate('${actplayer} may Capture'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actCapture', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_SELECT_TRAVELLER_CARD_OPTION => [
        'name' => 'selectTravellerCardOption',
        'description' => clienttranslate('${actplayer} must select an option from the Traveller Card'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actSelectTravellerCardOption', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_PLACE_MERRY_MAN_IN_SPACE => [
        'name' => 'placeMerryManInSpace',
        'description' => clienttranslate('${actplayer} must select a space to place a Merry Man'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actPlaceMerryManInSpace', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_PUT_CARD_IN_VICTIMS_PILE => [
        'name' => 'putCardInVictimsPile',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],
    ST_ROYAL_INSPECTION_UNREST => [
        'name' => 'royalInspectionUnrest',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],
    ST_ROYAL_INSPECTION_MISCHIEF => [
        'name' => 'royalInspectionMischief',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],
    ST_ROYAL_INSPECTION_RETURN_MERRY_MEN_FROM_PRISON => [
        'name' => 'royalInspectionReturnMerryMenFromPrison',
        'description' => clienttranslate('${actplayer} must return Merry Men from Prison'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actRoyalInspectionReturnMerryMenFromPrison', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_ROYAL_INSPECTION_REDEPLOYMENT_SHERIFF => [
        'name' => 'royalInspectionRedeploymentSheriff',
        'description' => clienttranslate('${actplayer} must redeploy Henchman'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actRoyalInspectionRedeploymentSheriff', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_ROYAL_INSPECTION_REDEPLOYMENT_ROBIN_HOOD => [
        'name' => 'royalInspectionRedeploymentRobinHood',
        'description' => clienttranslate('${actplayer} must redeploy Merry Men'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actRoyalInspectionRedeploymentRobinHood', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_ROYAL_INSPECTION_HIDE_ALL_MERRY_MEN => [
        'name' => 'royalInspectionHideAllMerryMen',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],
    ST_ROYAL_INSPECTION_RESET => [
        'name' => 'royalInspectionReset',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],
    ST_ROYAL_INSPECTION_GOVERNANCE => [
        'name' => 'royalInspectionGovernance',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],
    ST_ROYAL_INSPECTION_PLACE_ROBIN_HOOD => [
        'name' => 'royalInspectionPlaceRobinHood',
        'description' => clienttranslate('${actplayer} must place Robin Hood in any Forest'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actRoyalInspectionPlaceRobinHood', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_ROYAL_INSPECTION_SWAP_ROBIN_HOOD => [
        'name' => 'royalInspectionSwapRobinHood',
        'description' => clienttranslate('${actplayer} may swap Robin Hood with any Merry Man on the map'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actRoyalInspectionSwapRobinHood', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_AMBUSH_LIGHT => [
        'name' => 'eventAmbushLight',
        'description' => clienttranslate('${actplayer} may move Merry Men to a space with a Carriage'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventAmbushLight', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_REMOVE_TRAVELLER => [
        'name' => 'removeTraveller',
        'description' => clienttranslate('${actplayer} must remove a Traveller'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actRemoveTraveller', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_FORTUNE_EVENT_QUEEN_ELEANOR => [
        'name' => 'fortuneEventQueenEleanor',
        'description' => clienttranslate('${actplayer} may remove a Noble Knight from the Traveller deck to the Victims Pile'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actFortuneEventQueenEleanor', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_GUY_OF_GISBORNE => [
        'name' => 'eventGuyOfGisborne',
        'description' => clienttranslate('${actplayer}'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventGuyOfGisborne', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_REMOVE_CAMP => [
        'name' => 'removeCamp',
        'description' => clienttranslate('${actplayer} must remove a Camp'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actRemoveCamp', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_PLACE_HENCHMEN => [
        'name' => 'placeHenchmen',
        'description' => clienttranslate('${actplayer} may place Henchmen'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actPlaceHenchmen', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_A_TALE_OF_TWO_LOVERS_LIGHT => [
        'name' => 'eventATaleOfTwoLoversLight',
        'description' => clienttranslate('${actplayer} must select a single space'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventATaleOfTwoLoversLight', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_FORTUNE_EVENT_DAY_OF_MARKET_SHERIFF => [
        'name' => 'fortuneEventDayOfMarketSheriff',
        'description' => clienttranslate('${actplayer} may return any number of Henchmen'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actFortuneEventDayOfMarketSheriff', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_FORTUNE_EVENT_DAY_OF_MARKET_ROBIN_HOOD => [
        'name' => 'fortuneEventDayOfMarketRobinHood',
        'description' => clienttranslate('${actplayer} may return one Merry Man'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actFortuneEventDayOfMarketRobinHood', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_GREAT_ESCAPE_LIGHT => [
        'name' => 'eventGreatEscapeLight',
        'description' => clienttranslate('${actplayer} must place Merry Men from Prison adjacent to Nottingham'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventGreatEscapeLight', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_SELECT_SPACE => [
        'name' => 'eventSelectSpace',
        'description' => clienttranslate('${actplayer} must select a single space'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventSelectSpace', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_SELECT_FORCES => [
        'name' => 'eventSelectForces',
        'description' => clienttranslate('${actplayer} must select a single space'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventSelectForces', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_BOATS_BRIDGES_DARK => [
        'name' => 'eventBoatsBridgesDark',
        'description' => clienttranslate('${actplayer} may place the Bridge'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventBoatsBridgesDark', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_BOATS_BRIDGES_LIGHT => [
        'name' => 'eventBoatsBridgesLight',
        'description' => clienttranslate('${actplayer} may move Merry Men'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventBoatsBridgesLight', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_REPLACE_HENCHMEN => [
        'name' => 'eventReplaceHenchmen',
        'description' => clienttranslate('${actplayer} may replace Henchmen'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventReplaceHenchmen', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_WILL_STUTELY_LIGHT => [
        'name' => 'eventWillStutelyLight',
        'description' => clienttranslate('${actplayer} may move a Hidden Merry Man'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventWillStutelyLight', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_ROYAL_PARDON_LIGHT => [
        'name' => 'eventRoyalPardonLight',
        'description' => clienttranslate('${actplayer} may place Merry Men from Prison'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventRoyalPardonLight', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_EVENT_MAID_MARIAN_DARK => [
        'name' => 'eventMaidMarianDark',
        'description' => clienttranslate('${actplayer} may remove a Carriage to set one Parish to Submissive'),
        'descriptionmyturn' => clienttranslate('${you}'),
        'type' => 'activeplayer',
        'args' => 'argsAtomicAction',
        'action' => 'stAtomicAction',
        'possibleactions' => ['actEventMaidMarianDark', 'actPassOptionalAction', 'actRestart'],
    ],
    ST_ROYAL_INSPECTION_CHECK_DONATE => [
        'name' => 'royalInspectionCheckDonate',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],
    ST_ROYAL_INSPECTION_MOVE_MARKER => [
        'name' => 'royalInspectionMoveMarker',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],
    ST_FORTUNE_EVENT_WARDEN_OF_THE_FOREST_RESULT => [
        'name' => 'fortuneEventWardenOfTheForestResult',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],
    ST_PUT_TRAVELLER_IN_DISCARD_PILE => [
        'name' => 'putTravellerInDiscardPile',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],
    ST_MESSAGE => [
        'name' => 'message',
        'description' => '',
        'type' => 'game',
        'action' => 'stAtomicAction',
        'transitions' => [],
    ],
);
