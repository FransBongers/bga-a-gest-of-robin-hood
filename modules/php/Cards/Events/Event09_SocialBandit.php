<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;

class Event09_SocialBandit extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event09_SocialBandit';
    $this->title = clienttranslate('Social Bandit');
    $this->titleLight = clienttranslate('People\'s hero');
    $this->textLight = clienttranslate('Reveal Robin Hood in a Parish to place a Camp there and gain 2 Shillings.');
    $this->titleDark = clienttranslate('Out of touch outlaw');
    $this->textDark = clienttranslate('Reveal Robin Hood and set the space he is in to Submissive (if possible).');
    $this->carriageMoves = 2;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }

  // ..######..##.....##..#######...#######...######..########
  // .##....##.##.....##.##.....##.##.....##.##....##.##......
  // .##.......##.....##.##.....##.##.....##.##.......##......
  // .##.......#########.##.....##.##.....##..######..######..
  // .##.......##.....##.##.....##.##.....##.......##.##......
  // .##....##.##.....##.##.....##.##.....##.##....##.##......
  // ..######..##.....##..#######...#######...######..########

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  public function performLightEffect($player, $successful, $ctx = null, $space = null)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $robinHood->reveal($player);

    GameMap::placeCamp($player, Spaces::get($robinHood->getLocation()));

    $player->incShillings(2);
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $robinHood->eventRevealBySheriff($player);
    if (in_array($robinHood->getLocation(), PARISHES)) {
      $space = Spaces::get($robinHood->getLocation());
      if ($space->isRevolting()) {
        $space->setToSubmissive($player);
      }
    }
  }

  public function canPerformLightEffect($player)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    return $robinHood->isHidden() && in_array($robinHood->getLocation(), PARISHES);
  }

  public function canPerformDarkEffect($player)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    return $robinHood->getLocation() !== PRISON;
  }
}
