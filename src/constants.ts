const MIN_PLAY_AREA_WIDTH = 1500; // Is this still used?
const MIN_NOTIFICATION_MS = 1200;

const ENABLED = 'enabled';
/**
 * Class names
 */
const DISABLED = 'disabled';
const GEST_SELECTABLE = 'gest_selectable';
const GEST_SELECTED = 'gest_selected';

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

const USED_CARRIAGES = 'usedCarriages';
const PRISION = 'prison';

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