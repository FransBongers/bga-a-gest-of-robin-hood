<?php

namespace AGestOfRobinHood\Managers;

use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Helpers\Utils;

/**
 * Cards
 */
class Cards extends \AGestOfRobinHood\Helpers\Pieces
{
  protected static $table = 'cards';
  protected static $prefix = 'card_';
  protected static $customFields = [
    // 'extra_data'
  ];
  protected static $autoremovePrefix = false;
  protected static $autoreshuffle = false;
  protected static $autoIncrement = false;

  protected static function cast($card)
  {
    return self::getCardInstance($card['card_id'], $card);
  }

  private static function getClassPrefix($cardId)
  {
    if (Utils::startsWith($cardId, 'Event')) {
      return 'Events';
    }
    return 'Travellers';
  }

  public static function getCardInstance($id, $data = null)
  {
    $prefix = self::getClassPrefix($id);

    $className = "\AGestOfRobinHood\Cards\\$prefix\\$id";
    return new $className($data);
  }

  //////////////////////////////////
  //////////////////////////////////
  //////////// GETTERS //////////////
  //////////////////////////////////
  //////////////////////////////////



  // public static function getOfTypeInLocation($type, $location)
  // {
  //   return self::getSelectQuery()
  //     ->where(static::$prefix . 'id', 'LIKE', $type . '%')
  //     ->where(static::$prefix . 'location', 'LIKE', $location . '%')
  //     ->get()
  //     ->toArray();
  // }

  // public static function getUiData()
  // {
  //   return self::getPool()
  //     ->merge(self::getInLocationOrdered('inPlay'))
  //     ->merge(self::getInLocation('base_%'))
  //     ->merge(self::getInLocation('projects_%'))
  //     ->ui();
  // }

  public static function getStaticData()
  {
    $cards = Cards::getAll();
    $staticData = [];
    foreach ($cards as $cardId => $card) {
      $staticData[explode('_', $card->getId())[0]] = $card->getStaticData();
    }
    return $staticData;
  }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  private static function createEventsDeck()
  {
    // Create three piles with regular events and a fortune event
    for ($i = 0; $i <= 2; $i++) {
      $tempLocation = 'temp_pile_' . $i;
      // Shuffle four regular events and one fortune event
      self::pickForLocation(4, REGULAR_EVENTS_POOL, $tempLocation);
      self::pickForLocation(1, FORTUNE_EVENTS_POOL, $tempLocation);
      self::shuffle($tempLocation);
      // Add two more regular events on top
      self::insertOnTop(self::getTopOf(REGULAR_EVENTS_POOL)->getId(), $tempLocation);
      self::insertOnTop(self::getTopOf(REGULAR_EVENTS_POOL)->getId(), $tempLocation);
    }

    // Add created stacks and Royal Inspections to events deck
    for ($i = 0; $i <= 2; $i++) {
      $tempLocation = 'temp_pile_' . $i;
      // King Richard already is at bottom of events deck
      // so only need to add the Royal Inspections
      if ($i !== 0) {
        self::insertOnTop(self::getTopOf(ROYAL_INSPECTIONS_POOL)->getId(), EVENTS_DECK);
      }
      $cardCountDeck = self::countInLocation(EVENTS_DECK);

      $cardsInPile = self::getInLocation($tempLocation);
      foreach ($cardsInPile as $cardId => $card) {
        self::move($cardId, EVENTS_DECK, $card->getState() + $cardCountDeck);
      }
    }
  }

  private static function setupLoadCards()
  {
    // Load list of cards
    include dirname(__FILE__) . '/../Cards/list.inc.php';

    // self::DB()
    //   ->delete()
    //   ->run();

    // return;
    foreach ($cardIds as $cId) {
      $card = self::getCardInstance($cId);

      $location = $card->getSetupLocation();

      $cards[$cId] = [
        'id' => $cId,
        'location' => $location,
      ];
    }

    // Create the cards
    self::create($cards, null);

    // Shuffle all piles
    self::shuffle(REGULAR_EVENTS_POOL);
    self::shuffle(FORTUNE_EVENTS_POOL);
    self::shuffle(ROYAL_INSPECTIONS_POOL);
    self::shuffle(TRAVELLERS_DECK);
  }

  /* Creation of the cards */
  public static function setupNewGame($players = null, $options = null)
  {
    self::setupLoadCards();
    self::createEventsDeck();
  }

  public static function getUiData()
  {
    $travellersDeck = self::getInLocation(TRAVELLERS_DECK)->toArray();

    $data = [
      EVENTS_DISCARD => self::getTopOf(EVENTS_DISCARD),
      // TRAVELLERS_DISCARD => self::getTopOf(TRAVELLERS_DISCARD),
      // TRAVELLERS_VICTIMS_PILE => self::getTopOf(TRAVELLERS_VICTIMS_PILE),
      TRAVELLER_ROBBED => self::getTopOf(TRAVELLER_ROBBED),
      'counts' => [
        TRAVELLERS_DECK => count($travellersDeck),
        TRAVELLERS_DISCARD => self::countInLocation(TRAVELLERS_DISCARD),
        TRAVELLERS_VICTIMS_PILE => self::countInLocation(TRAVELLERS_VICTIMS_PILE)
      ]
    ];

    foreach(TRAVELLERS as $traveller) {
      $data['counts']['travellers'][$traveller] = 0;
    }

    foreach($travellersDeck as $card) {
      $traveller = explode('_', $card->getId())[1];
      $data['counts']['travellers'][$traveller] += 1;
    }

    return $data;
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

  public static function drawAndRevealCard()
  {
    $card = self::getTopOf(EVENTS_DECK);
    Notifications::drawAndRevealCard($card);
    Cards::insertOnTop($card->getId(), EVENTS_DISCARD);

    return Cards::get($card->getId());
  }

  public static function drawAndRevealTravellerCard($player)
  {
    $card = self::getTopOf(TRAVELLERS_DECK);
    // TODO: check what needs to be done? Probably shuffle?
    if ($card === null) {
      return null;
    }
    Notifications::drawAndRevealTravellerCard($player, $card);
    Cards::insertOnTop($card->getId(), TRAVELLER_ROBBED);

    return Cards::get($card->getId());
  }

  public static function getBalladAndEvent($beforeDraw = false)
  {
    $deckCount = self::countInLocation(EVENTS_DECK);
    if ($beforeDraw) {
      $deckCount--;
    }
    $balladNumber = ceil(3 - ($deckCount / 8));
    $eventNumber = 8 - ($deckCount % 8);
    return [
      'balladNumber' => $balladNumber,
      'eventNumber' => $eventNumber,
    ];
  }
}
