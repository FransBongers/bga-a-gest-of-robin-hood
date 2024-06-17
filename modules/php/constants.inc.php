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
const DECK = 'deck';

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
const ST_PRE_END_GAME = 98;
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
const ST_TURNCOAT = 33;
const ST_DONATE = 34;
const ST_SWASHBUCKLE = 35;
const ST_INSPIRE = 36;
const ST_RIDE = 37;
const ST_CONFISCATE = 38;
const ST_DISPERSE = 39;
const ST_HIRE = 40;
const ST_PATROL = 41;
const ST_CAPTURE = 42;
const ST_SELECT_TRAVELLER_CARD_OPTION = 43;
const ST_PLACE_MERRY_MAN_IN_SPACE = 44;
const ST_PUT_CARD_IN_VICTIMS_PILE = 45;
const ST_ROYAL_INSPECTION_UNREST = 46;
const ST_ROYAL_INSPECTION_MISCHIEF = 47;
const ST_ROYAL_INSPECTION_GOVERNANCE = 48;
const ST_ROYAL_INSPECTION_REDEPLOYMENT_SHERIFF = 49;
const ST_ROYAL_INSPECTION_REDEPLOYMENT_ROBIN_HOOD = 50;
const ST_ROYAL_INSPECTION_RESET = 51;
const ST_ROYAL_INSPECTION_RETURN_MERRY_MEN_FROM_PRISON = 52;
const ST_ROYAL_INSPECTION_HIDE_ALL_MERRY_MEN = 53;
const ST_ROYAL_INSPECTION_PLACE_ROBIN_HOOD = 54;
const ST_ROYAL_INSPECTION_SWAP_ROBIN_HOOD = 55;
const ST_SELECT_EVENT_EFFECT = 56;
const ST_EVENT_AMBUSH_LIGHT = 57;
const ST_REMOVE_TRAVELLER = 58;
const ST_FORTUNE_EVENT_QUEEN_ELEANOR = 59;
const ST_EVENT_GUY_OF_GISBORNE = 60;
const ST_REMOVE_CAMP = 61;
const ST_PLACE_HENCHMEN = 62;
const ST_EVENT_A_TALE_OF_TWO_LOVERS_LIGHT = 63;
const ST_FORTUNE_EVENT_DAY_OF_MARKET_ROBIN_HOOD = 64;
const ST_FORTUNE_EVENT_DAY_OF_MARKET_SHERIFF = 65;
const ST_EVENT_SELECT_SPACE = 67;
const ST_EVENT_SELECT_FORCES = 68;
const ST_EVENT_BOATS_BRIDGES_DARK = 69;
const ST_EVENT_BOATS_BRIDGES_LIGHT = 70;
const ST_EVENT_NOTTINGHAM_FAIR_LIGHT = 71;

/**
 * Atomic actions
 */
const PLAYER_ACTION = 'PLAYER_ACTION';
const CHOOSE_ACTION = 'CHOOSE_ACTION';
const MOVE_CARRIAGE = 'MOVE_CARRIAGE';
const PLACE_HENCHMEN = 'PLACE_HENCHMEN';
const PLACE_MERRY_MAN_IN_SPACE = 'PLACE_MERRY_MAN_IN_SPACE';
const PRE_END_GAME = 'PRE_END_GAME';
const PUT_CARD_IN_VICTIMS_PILE = 'PUT_CARD_IN_VICTIMS_PILE';
const REMOVE_CAMP = 'REMOVE_CAMP';
const REMOVE_TRAVELLER = 'REMOVE_TRAVELLER';
const ROYAL_INSPECTION_HIDE_ALL_MERRY_MEN = 'ROYAL_INSPECTION_HIDE_ALL_MERRY_MEN';
const ROYAL_INSPECTION_UNREST = 'ROYAL_INSPECTION_UNREST';
const ROYAL_INSPECTION_MISCHIEF = 'ROYAL_INSPECTION_MISCHIEF';
const ROYAL_INSPECTION_GOVERNANCE = 'ROYAL_INSPECTION_GOVERNANCE';
const ROYAL_INSPECTION_PLACE_ROBIN_HOOD = 'ROYAL_INSPECTION_PLACE_ROBIN_HOOD';
const ROYAL_INSPECTION_REDEPLOYMENT_SHERIFF = 'ROYAL_INSPECTION_REDEPLOYMENT_SHERIFF';
const ROYAL_INSPECTION_REDEPLOYMENT_ROBIN_HOOD = 'ROYAL_INSPECTION_REDEPLOYMENT_ROBIN_HOOD';
const ROYAL_INSPECTION_RESET = 'ROYAL_INSPECTION_RESET';
const ROYAL_INSPECTION_RETURN_MERRY_MEN_FROM_PRISON = 'ROYAL_INSPECTION_RETURN_MERRY_MEN_FROM_PRISON';
const ROYAL_INSPECTION_SWAP_ROBIN_HOOD = 'ROYAL_INSPECTION_SWAP_ROBIN_HOOD';
const SELECT_DEED = 'SELECT_DEED';
const SELECT_EVENT_EFFECT = 'SELECT_EVENT_EFFECT';
const SELECT_PLOT = 'SELECT_PLOT';
const SELECT_TRAVELLER_CARD_OPTION = 'SELECT_TRAVELLER_CARD_OPTION';
const SETUP_ROBIN_HOOD = 'SETUP_ROBIN_HOOD';
// Plots - Robin Hood
const RECRUIT = 'RECRUIT';
const ROB = 'ROB';
const SNEAK = 'SNEAK';
// Plots - Sheriff;
const CAPTURE = 'CAPTURE';
const HIRE = 'HIRE';
const PATROL = 'PATROL';
// Deeds - Robin Hood
const DONATE = 'DONATE';
const INSPIRE = 'INSPIRE';
const SWASHBUCKLE = 'SWASHBUCKLE';
const TURNCOAT = 'TURNCOAT';
// Deeds - Sheriff
const CONFISCATE = 'CONFISCATE';
const DISPERSE = 'DISPERSE';
const RIDE = 'RIDE';
// Events
const EVENT_AMBUSH_LIGHT = 'EVENT_AMBUSH_LIGHT';
const EVENT_A_TALE_OF_TWO_LOVERS_LIGHT = 'EVENT_A_TALE_OF_TWO_LOVERS_LIGHT';
const EVENT_BOATS_BRIDGES_DARK = 'EVENT_BOATS_BRIDGES_DARK';
const EVENT_BOATS_BRIDGES_LIGHT = 'EVENT_BOATS_BRIDGES_LIGHT';
const EVENT_GUY_OF_GISBORNE = 'EVENT_GUY_OF_GISBORNE';
const EVENT_NOTTINGHAM_FAIR_LIGHT = 'EVENT_NOTTINGHAM_FAIR_LIGHT';
const EVENT_SELECT_FORCES = 'EVENT_SELECT_FORCES';
const EVENT_SELECT_SPACE = 'EVENT_SELECT_SPACE';
// Fortune Event
const FORTUNE_EVENT_DAY_OF_MARKET_ROBIN_HOOD = 'FORTUNE_EVENT_DAY_OF_MARKET_ROBIN_HOOD';
const FORTUNE_EVENT_DAY_OF_MARKET_SHERIFF = 'FORTUNE_EVENT_DAY_OF_MARKET_SHERIFF';
const FORTUNE_EVENT_QUEEN_ELEANOR = 'FORTUNE_EVENT_QUEEN_ELEANOR';

const GREEN = 'green';
const WHITE = 'white';

const GREEN_DIE_FACES = [-1, -1, 0, 1, 2, 3];
const WHITE_DIE_FACES = [-2, -1, -1, 0, 1, 2];

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
const HIDDEN_CARRIAGE = 'HiddenCarriage';

const CARRIAGE_TYPES = [
  TALLAGE_CARRIAGE,
  TRAP_CARRIAGE,
  TRIBUTE_CARRIAGE,
];

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
const ROBIN_HOOD_SUPPLY = 'robinHood_supply';
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

const REMOVED_FROM_GAME = 'removedFromGame';

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

const PARISHES = [BINGHAM, BLYTH, MANSFIELD, NEWARK, REMSTON, RETFORD, TUXFORD];

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

const BLYTH_RETFORD_BORDER = 'Blyth_Retford_border';
const BINGHAM_NEWARK_BORDER = 'Bingham_Newark_border';
const BINGHAM_SOUTHWELL_FOREST_BORDER = 'Bingham_SouthwellForest_border';
const BINGHAM_NOTTINGHAM_BORDER = 'Bingham_Nottingham_border';
const NOTTINGHAM_REMSTON_BORDER = 'Nottingham_Remston_border';

const RIVER_BORDERS = [
  BLYTH_RETFORD_BORDER => [BLYTH, RETFORD],
  BINGHAM_NEWARK_BORDER => [BINGHAM, NEWARK],
  BINGHAM_SOUTHWELL_FOREST_BORDER => [BINGHAM, SOUTHWELL_FOREST],
  BINGHAM_NOTTINGHAM_BORDER => [BINGHAM, NOTTINGHAM],
  NOTTINGHAM_REMSTON_BORDER => [NOTTINGHAM, REMSTON],
];

const USED_CARRIAGES = 'usedCarriages';
const PRISON = 'prison';

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

/**
 * Constants used ofr event effects
 */
const GAIN_TWO_SHILLINGS = 'gainTwoShillings';
const LIGHT = 'light';
const DARK = 'dark';

const MONK = 'monk';
const KNIGHT = 'knight';

const KNIGHT_IDS = [
  'Traveller03_NobleKnight',
  'Traveller04_NobleKnight'
];

const MONK_IDS = [
  'Traveller06_Monks',
  'Traveller07_Monks',
  'Traveller08_Monks',
];
