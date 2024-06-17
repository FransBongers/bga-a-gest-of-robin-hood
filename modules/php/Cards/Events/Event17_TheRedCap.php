<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;

class Event17_TheRedCap extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event17_TheRedCap';
    $this->title = clienttranslate('The Red Cap');
    $this->titleLight = clienttranslate('Robin wins archery contest');
    $this->textLight = clienttranslate('Reveal Robin Hood to set one adjacent Parish to Revolting, then shift one step towards Justice.');
    $this->titleDark = clienttranslate('Chief archer leads henchmen');
    $this->textDark = clienttranslate('Reveal Robin Hood and move up to two Henchmen to his space from any other space.');
    $this->carriageMoves = 1;
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
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_SELECT_SPACE,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'effect' => LIGHT,
    ]));
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_SELECT_FORCES,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'effect' => DARK,
    ]));
  }

  public function canPerformLightEffect($player)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    if (!$robinHood->isHidden() || in_array($robinHood->getLocation(), [PRISON, ROBIN_HOOD_SUPPLY])) {
      return false;
    }
    return count($this->getDarkOptions()) > 0;
  }

  public function canPerformDarkEffect($player)
  {
    return count($this->getDarkOptions()) > 0;
  }


  // .########..########..######...#######..##.......##.....##.########
  // .##.....##.##.......##....##.##.....##.##.......##.....##.##......
  // .##.....##.##.......##.......##.....##.##.......##.....##.##......
  // .########..######....######..##.....##.##.......##.....##.######..
  // .##...##...##.............##.##.....##.##........##...##..##......
  // .##....##..##.......##....##.##.....##.##.........##.##...##......
  // .##.....##.########..######...#######..########....###....########

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  public function resolveDarkEffect($player, $ctx, $space)
  {
    // $spaceId = $space->getId();
    // $forces = Forces::getInLocation($spaceId)->toArray();

    // foreach ($forces as $force) {
    //   if ($force->isMerryMan() && $force->isHidden()) {
    //     $force->reveal($player);
    //   }
    // }

    // Players::moveRoyalFavour($player, 1, ORDER);
  }

  public function getDarkStateArgs()
  {
    // return [
    //   'spaces' => $this->getLightOptions(),
    //   'title' => clienttranslate('${you} must select a Forest'),
    //   'confirmText' => clienttranslate('Reveal all Merry Men in in ${spaceName}?'),
    //   'titleOther' => clienttranslate('${actplayer} must select a Forest'),
    // ];
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...


  private function getLightOptions()
  {
    // return Spaces::get([SOUTHWELL_FOREST, SHIRE_WOOD])->toArray();
  }

  private function getDarkOptions()
  {
    $options = [];
    // foreach ([SHIRE_WOOD, SOUTHWELL_FOREST] as $spaceId) {
    //   $options[$spaceId] = Utils::array_some(Forces::getInLocation($spaceId)->toArray(), function ($force) {
    //     return $force->isMerryMan() && $force->isHidden();
    //   });
    // }
    return $options;
  }
}
