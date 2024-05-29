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
  protected static $customFields = ['extra_data'];
  protected static $autoremovePrefix = false;
  protected static $autoreshuffle = false;
  protected static $autoIncrement = false;

  protected static function cast($card)
  {
    return self::getCardInstance($card['card_id'], $card);
  }

  // private static function getClassPrefix($cardId)
  // {
  //   if (Utils::startsWith($cardId, 'Victory')) {
  //     return 'Victory';
  //   }
  //   if (Utils::startsWith($cardId, 'Empire')) {
  //     return 'Empire';
  //   }
  //   return 'Tableau';
  // }

  public static function getCardInstance($id, $data = null)
  {
    // $prefix = self::getClassPrefix($id);

    $className = "\AGestOfRobinHood\Cards\\$id";
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

  // public static function getStaticData()
  // {
  //   $cards = Cards::getAll();
  //   $staticData = [];
  //   foreach($cards as $cardId => $card) {
  //     if ($card->getType() !== TABLEAU_CARD) {
  //       continue;
  //     }
  //     $staticData[explode('_',$card->getId())[0]] = $card->getStaticData();
  //   }
  //   return $staticData;
  // }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  private static function setupLoadCards()
  {
    // Load list of cards
    include dirname(__FILE__) . '/../Cards/list.inc.php';

    // return;
    foreach ($cardIds as $cId) {
      // // $card = self::getCardInstance($cId);

      // $location = Locations::cardPool();
      // $extraData = null;
      // // // $location = 'deck';



      // $cards[$cId] = [
      //   'id' => $cId,
      //   'location' => $location,
      //   'extra_data' => json_encode($extraData)
      // ];
    }
    Notifications::log('cards', $cards);
    // // Create the cards
    self::create($cards, null);
  }

  /* Creation of the cards */
  public static function setupNewGame($players = null, $options = null)
  {
    self::setupLoadCards();
  }

}
