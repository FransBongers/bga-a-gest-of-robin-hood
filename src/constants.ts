const MIN_PLAY_AREA_WIDTH = 1500; // Is this still used?
const MIN_NOTIFICATION_MS = 1200;

const ENABLED = 'enabled';
/**
 * Class names
 */
const DISABLED = 'disabled';
const GEST_SELECTABLE = 'gest_selectable';
const GEST_SELECTED = 'gest_selected';
const GEST_NONE = 'gest_none';

/**
 * Card locations
 */
const DISCARD = 'discard';

/**
 * Setting ids
 */
// const CARD_SIZE_IN_LOG = 'cardSizeInLog';
// const CARD_INFO_IN_TOOLTIP = 'cardInfoInTooltip';
const PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY =
  'confirmEndOfTurnPlayerSwitchOnly';
const PREF_SHOW_ANIMATIONS = 'showAnimations';
const PREF_ANIMATION_SPEED = 'animationSpeed';
const PREF_CARD_INFO_IN_TOOLTIP = 'cardInfoInTooltip';
const PREF_CARD_SIZE = 'cardSize';
const PREF_CARD_SIZE_IN_LOG = 'cardSizeInLog';
const PREF_DISABLED = 'disabled';
const PREF_ENABLED = 'enabled';
const PREF_SINGLE_COLUMN_MAP_SIZE = 'singleColumnMapSize';

/**
 * Ids of markers
 */
const ROYAL_FAVOUR_MARKER = 'royalFavourMarker';
const ROYAL_INSPECTION_MARKER = 'royalInspectionMarker';
const ROBIN_HOOD_ELIGIBILITY_MARKER = 'robinHoodEligibilityMarker';
const SHERIFF_ELIGIBILITY_MARKER = 'sheriffEligibilityMarker';

const GAME_MAP_MARKERS = [
  ROYAL_FAVOUR_MARKER,
  ROYAL_INSPECTION_MARKER,
  ROBIN_HOOD_ELIGIBILITY_MARKER,
  SHERIFF_ELIGIBILITY_MARKER,
];

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

const FOREST_SPACES = [SHIRE_WOOD, SOUTHWELL_FOREST];

const BLYTH_RETFORD_BORDER = 'Blyth_Retford_border';
const BINGHAM_NEWARK_BORDER = 'Bingham_Newark_border';
const BINGHAM_SOUTHWELL_FOREST_BORDER = 'Bingham_SouthwellForest_border';
const BINGHAM_NOTTINGHAM_BORDER = 'Bingham_Nottingham_border';
const NOTTINGHAM_REMSTON_BORDER = 'Nottingham_Remston_border';
const NEWARK_SOUTHWELL_FOREST_BORDER = 'Newark_SouthwellForest_border';

const RIVER_BORDERS = {
  [BLYTH_RETFORD_BORDER]: [BLYTH, RETFORD],
  [BINGHAM_NEWARK_BORDER]: [BINGHAM, NEWARK],
  [BINGHAM_SOUTHWELL_FOREST_BORDER]: [BINGHAM, SOUTHWELL_FOREST],
  [BINGHAM_NOTTINGHAM_BORDER]: [BINGHAM, NOTTINGHAM],
  [NOTTINGHAM_REMSTON_BORDER]: [NOTTINGHAM, REMSTON],
  [NEWARK_SOUTHWELL_FOREST_BORDER]: [NEWARK, SOUTHWELL_FOREST],
};

/**
 * Supply locations
 */
const CAMPS_SUPPLY = 'camps_supply';
const MERRY_MEN_SUPPLY = 'merryMen_supply';
const ROBIN_HOOD_SUPPLY = 'robinHood_supply';
const HENCHMEN_SUPPLY = 'henchmen_supply';
const CARRIAGE_SUPPLY = 'carriage_supply';

// Other Locations
const USED_CARRIAGES = 'usedCarriages';
const PRISON = 'prison';

// Used for log tokens
const REVEALED = 'revealed';
const HIDDEN = 'hidden';

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
 * Initiative track locations
 */
const SINGLE_PLOT = 'singlePlot';
const EVENT = 'event';
const PLOTS_AND_DEEDS = 'plotsAndDeeds';
const FIRST_ELIGIBLE = 'firstEligible';
const SECOND_ELIGIBLE = 'secondEligible';

/**
 * Recruit options
 */
const PLACE_MERRY_MAN = 'placeMerryMan';
const REPLACE_MERRY_MAN_WITH_CAMP = 'replaceMerryManWithCamp';
const PLACE_TWO_MERRY_MEN = 'placeTwoMerryMen';
const FLIP_ALL_MERRY_MAN_TO_HIDDEN = 'flipAllMerryManToHidden';

/**
 * Space status
 */
const PASSIVE = 'passive';
const REVOLTING = 'revolting';
const SUBMISSIVE = 'submissive';

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
const TRAVELLER_ROBBED = 'travellerRobbed';
const TRAVELLERS_VICTIMS_PILE = 'travellersVictimsPile';

const REMOVED_FROM_GAME = 'removedFromGame';

/**
 * Constants used ofr event effects
 */
const GAIN_TWO_SHILLINGS = 'gainTwoShillings';
const LIGHT = 'light';
const DARK = 'dark';

const ONE_SPACE = 'oneSpace';

const MONK = 'monk';

const MONK_IDS = [
  'Traveller06_Monks',
  'Traveller07_Monks',
  'Traveller08_Monks',
];

const TRAVELLERS = [
  'RichMerchant',
  'NobleKnight',
  'Monks',
  'ThePotter',
  'TheMillersSon',
  'BishopOfHereford',
  'GuyOfGisborne',
  'RichardAtTheLea',
];
