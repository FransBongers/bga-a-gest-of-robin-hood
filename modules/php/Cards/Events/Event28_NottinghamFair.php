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

class Event28_NottinghamFair extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event28_NottinghamFair';
    $this->title = clienttranslate('Nottingham Fair');
    $this->titleLight = clienttranslate('Little John befriends the Sheriff\'s cook');
    $this->textLight = clienttranslate('Replace up to 2 Henchmen in Nottingham with Merry Men.');
    $this->titleDark = clienttranslate('Too much stout ale');
    $this->textDark = clienttranslate('Remove up to 2 Merry Men from spaces adjacent to Nottingham to Available.');
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
      'action' => EVENT_SELECT_FORCES,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'effect' => LIGHT,
      // 'optional' => true,
    ]));
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_SELECT_FORCES,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'effect' => DARK,
      // 'optional' => true,
    ]));
  }

  public function canPerformLightEffect($player)
  {
    return count($this->getLightOptions()) > 0;
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

  public function resolveLightEffect($player, $ctx, $forces)
  {
    foreach($forces as $force) {
      $force->returnToSupply($player);
    }
    // TODO: allow placement of Robin Hood?
    GameMap::placeMerryMan($player, Spaces::get(NOTTINGHAM), false);
  }

  public function resolveDarkEffect($player, $ctx, $forces)
  {
    foreach($forces as $force) {
      $force->returnToSupply($player);
    }
  }

  public function getLightStateArgs()
  {
    $forces = $this->getDarkOptions();
    return [
      '_private' => [
        'forces' => $forces,
        'min' => 1,
        'max' => min(2, count($forces)),
        'type' => 'private'
      ],
      'title' => clienttranslate('${you} may select Henchmen to replace (${count} remaining)'),
      'confirmText' => clienttranslate('Replace Henchmen with Merry Men?'),
      'titleOther' => clienttranslate('${actplayer} may replace Henchmen with Merry Men'),
    ];
  }

  public function getDarkStateArgs()
  {
    $forces = $this->getDarkOptions();
    return [
      '_private' => [
        'forces' => $forces,
        'min' => 1,
        'max' => min(2, count($forces)),
        'type' => 'public'
      ],
      'title' => clienttranslate('${you} may select Merry Men to remove to Available (${count} remaining)'),
      'confirmText' => clienttranslate('Remove Merry Men?'),
      'titleOther' => clienttranslate('${actplayer} may remove Merry Men'),
    ];
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  public function resolveLightEffectAutomatically($player, $ctx)
  {
    return false;
  }

  private function getLightOptions()
  {
    $henchmen = Forces::getOfType(HENCHMEN);
    return Utils::filter($henchmen, function ($henchman) {
      return $henchman->getLocation() === NOTTINGHAM;
    });
  }

  private function getDarkOptions()
  {
    $merryMen = Forces::getOfType(MERRY_MEN);
    $spaceIds = Spaces::get(NOTTINGHAM)->getAdjacentSpaceIds();
    return Utils::filter($merryMen, function ($merryMan) use ($spaceIds) {
      return in_array($merryMan->getLocation(), $spaceIds);
    });
  }
}
