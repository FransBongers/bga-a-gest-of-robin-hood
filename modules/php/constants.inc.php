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


/**
 * Atomic actions
 */
const PLAYER_ACTION = 'PLAYER_ACTION';


const DIE_FACES = [];

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
 * Force types
 */
const CAMP = 'camp';
const MERRY_MEN = 'merryMen';
const HENCHMEN = 'henchmen';
const ROBIN_HOOD = 'robinHood';

/**
 * Spaces
 */
const BINGHAM = 'Bingham';
const BLYTH = 'Blyth';
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
  NEWARK,
  NOTTINGHAM,
  OLLERTON_HILL,
  REMSTON,
  RETFORD,
  SHIRE_WOOD,
  SOUTHWELL_FOREST,
  TUXFORD,
];
