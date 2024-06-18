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

class Event26_Corruption extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event26_Corruption';
    $this->title = clienttranslate('Corruption');
    $this->titleLight = clienttranslate('Sheriff\'s authority crumbles');
    $this->textLight = clienttranslate('Pay 1 Shilling to replace 1 Henchman with a Merry Man.');
    $this->titleDark = clienttranslate('Hungry Merry Men defect');
    $this->textDark = clienttranslate('Pay 2 Shillings to replace up to 2 Merry Men in one space with 1 Henchmen each.');
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
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_REPLACE_HENCHMEN,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'cost' => 1
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
    return $player->getShillings() > 0 && count(AtomicActions::get(EVENT_REPLACE_HENCHMEN)->getOptions($this->id)) > 0;
  }

  public function canPerformDarkEffect($player)
  {
    return $player->getShillings() >= 2 && count($this->getDarkOptions()) > 0;
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

  // public function resolveLightEffect($player, $ctx, $forces)
  // {
  //   $player->payShillings(1);
  //   foreach($forces as $force) {
  //     $force->returnToSupply($player);
  //   }
  //   GameMap::placeMerryMan()
  // }

  public function resolveDarkEffect($player, $ctx, $forces)
  {
    $player->payShillings(2);
    $spaceId = $forces[0]->getLocation();
    foreach ($forces as $force) {
      $force->returnToSupply($player);
    }
    GameMap::placeHenchmen($player, Spaces::get($spaceId), count($forces));
  }

  // public function getLightStateArgs()
  // {
  //   $forces = $this->getLightOptions();
  //   return [
  //     '_private' => [
  //       'forces' => $forces,
  //       'min' => 1,
  //       'max' => 1,
  //       'type' => 'private'
  //     ],
  //     'title' => clienttranslate('${you} must select a Henchman to replace'),
  //     'confirmText' => clienttranslate('Replace Henchman with a Merry Man?'),
  //     'titleOther' => clienttranslate('${actplayer} may replace 1 Henchman with a Merry Man'),
  //   ];
  // }

  public function getDarkStateArgs()
  {
    $forces = $this->getDarkOptions();
    return [
      '_private' => [
        'forces' => $forces,
        'min' => 0,
        'max' => min(2, count($forces)),
        'type' => 'public',
        'conditions' => [ONE_SPACE],
      ],
      'title' => clienttranslate('${you} may select Merry Men to replace (${count} remaining)'),
      'confirmText' => clienttranslate('Replace Merry Men with Henchmen?'),
      'titleOther' => clienttranslate('${actplayer} may replace up to 2 Merry Man with Henchman'),
    ];
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  private function getDarkOptions()
  {
    $merryMen = Forces::getOfType(MERRY_MEN);
    $merryMen[] = Forces::get(ROBIN_HOOD);
    return Utils::filter($merryMen, function ($merryMan) {
      return in_array($merryMan->getLocation(), SPACES);
    });
  }
}
