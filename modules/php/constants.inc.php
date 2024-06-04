<?php
require_once 'gameoptions.inc.php';

/**
 * STATS
 */

const STAT_TURN = 12;

/**
 * Carc locations
 */
const DISCARD = 'discard';

/*
  * ENGINE
  */
const NODE_SEQ = 'seq';
const NODE_OR = 'or';
const NODE_XOR = 'xor';
const NODE_PARALLEL = 'parallel';
const NODE_LEAF = 'leaf';

const ZOMBIE = 98;
const PASS = 99;

const AFTER_FINISHING_ACTION = 'afterFinishing';

/**
 * State ids / names
 */

const ST_GAME_SETUP = 1;
const ST_GAME_SETUP_NAME = 'gameSetup';
// Boiler plate
const ST_BEFORE_START_OF_TURN = 6;
const ST_TURNACTION = 7;
const ST_RESOLVE_STACK = 90;
const ST_RESOLVE_CHOICE = 91;
const ST_IMPOSSIBLE_MANDATORY_ACTION = 92;
const ST_CONFIRM_TURN = 93;
const ST_CONFIRM_PARTIAL_TURN = 94;
const ST_GENERIC_NEXT_PLAYER = 95;
const ST_END_GAME = 99;
const ST_END_GAME_NAME = 'gameEnd';

const ST_CLEANUP = 88; // TODO: replace

// Game
const ST_PLAYER_ACTION = 22;
const ST_SETUP_ROBIN_HOOD = 23;
const ST_CHOOSE_ACTION = 24;
const ST_START_OF_ROUND = 25;
const ST_END_OF_ROUND = 26;
const ST_MOVE_CARRIAGE = 27;
const ST_SELECT_PLOT = 28;
const ST_SELECT_DEED = 29;
const ST_RECRUIT = 30;
const ST_SNEAK = 31;
const ST_ROB = 32;

/**
 * Atomic actions
 */
const PLAYER_ACTION = 'PLAYER_ACTION';
const CHOOSE_ACTION = 'CHOOSE_ACTION';
const MOVE_CARRIAGE = 'MOVE_CARRIAGE';
const SELECT_DEED = 'SELECT_DEED';
const SELECT_PLOT = 'SELECT_PLOT';
const SETUP_ROBIN_HOOD = 'SETUP_ROBIN_HOOD';

// Plots
const RECRUIT = 'RECRUIT';
const SNEAK = 'SNEAK';
const ROB = 'ROB';


const DIE_FACES = [];

/**
 * Force types
 */
const CAMP = 'Camp';
const MERRY_MEN = 'MerryMen';
const HENCHMEN = 'Henchmen';
const ROBIN_HOOD = 'RobinHood'; // also used for side
const CARRIAGE = 'Carriage';

const TALLAGE_CARRIAGE = 'TallageCarriage';
const TRIBUTE_CARRIAGE = 'TributeCarriage';
const TRAP_CARRIAGE = 'TrapCarriage';

/**
 * Sides
 */
const SHERIFF = 'Sheriff';

const ORDER = 'order';
const JUSTICE = 'justice';


const COLOR_SIDE_MAP = [
  "008000" => ROBIN_HOOD, // blue
  "c0c0c0" => SHERIFF, // green
];

const HIDDEN = 'hidden';
const REVEALED = 'revealed';

/**
 * Log tokens
 */
const LOG_TOKEN_BOLD_TEXT = 'boldText';
const LOG_TOKEN_NEW_LINE = 'newLine';

/**
 * Space status
 */
const PASSIVE = 'passive';
const REVOLTING = 'revolting';
const SUBMISSIVE = 'submissive';

const CAMPS_SUPPLY = 'camps_supply';
const MERRY_MEN_SUPPLY = 'merryMen_supply';
const HENCHMEN_SUPPLY = 'henchmen_supply';
const CARRIAGE_SUPPLY = 'carriage_supply';

/**
 * Card types
 */
const EVENT_CARD = 'eventCard';
const TRAVELLER_CARD = 'travellerCard';

const REGULAR_EVENT = 'regularEvent';
const FORTUNE_EVENT = 'fortuneEvent';
const ROYAL_INSPECTION = 'royalInspection';

/**
 * Card locations
 */
const REGULAR_EVENTS_POOL = 'regularEventsPool';
const FORTUNE_EVENTS_POOL = 'fortuneEventsPool';
const ROYAL_INSPECTIONS_POOL = 'royalInspectionsPool';
const EVENTS_DECK = 'eventsDeck';
const TRAVELLERS_DECK = 'travellersDeck';
const TRAVELLERS_POOL = 'travellersPool';

const EVENTS_DISCARD = 'eventsDiscard';
const TRAVELLERS_DISCARD = 'travellersDiscard';
const TRAVELLERS_VICTIMS_PILE = 'travellersVictimsPile';


/**
 * Spaces
 */
const BINGHAM = 'Bingham';
const BLYTH = 'Blyth';
const MANSFIELD = 'Mansfield';
const NEWARK = 'Newark';
const NOTTINGHAM = 'Nottingham';
const OLLERTON_HILL = 'OllertonHill';
const REMSTON = 'Remston';
const RETFORD = 'Retford';
const SHIRE_WOOD = 'ShireWood';
const SOUTHWELL_FOREST = 'SouthwellForest';
const TUXFORD = 'Tuxford';

const SPACES = [
  BINGHAM,
  BLYTH,
  MANSFIELD,
  NEWARK,
  NOTTINGHAM,
  OLLERTON_HILL,
  REMSTON,
  RETFORD,
  SHIRE_WOOD,
  SOUTHWELL_FOREST,
  TUXFORD,
];

const USED_CARRIAGES = 'usedCarriages';
const PRISION = 'prison';

/**
 * Markers
 */
const ROYAL_FAVOUR_MARKER = 'royalFavourMarker';
const ROYAL_INSPECTION_MARKER = 'royalInspectionMarker';
const ROBIN_HOOD_ELIGIBILITY_MARKER = 'robinHoodEligibilityMarker';
const SHERIFF_ELIGIBILITY_MARKER = 'sheriffEligibilityMarker';

/**
 * Initiative track locations
 */
const SINGLE_PLOT = 'singlePlot';
const EVENT = 'event';
const PLOTS_AND_DEEDS = 'plotsAndDeeds';
const FIRST_ELIGIBLE = 'firstEligible';
const SECOND_ELIGIBLE = 'secondEligible';

/**
 * Royal inspection track locations
 */
const UNREST = 'unrest';
const MISCHIEF = 'mischief';
const GOVERNANCE = 'governance';
const REDEPLOYMENT = 'redeployment';
const RESET = 'reset';
const BALAD = 'balad';

/**
 * Recruit options
 */
const PLACE_MERRY_MAN = 'placeMerryMan';
const REPLACE_MERRY_MAN_WITH_CAMP = 'replaceMerryManWithCamp';
const PLACE_TWO_MERRY_MEN = 'placeTwoMerryMen';
const FLIP_ALL_MERRY_MAN_TO_HIDDEN = 'flipAllMerryManToHidden';