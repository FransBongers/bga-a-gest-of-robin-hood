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

class Event19_RoyalPardon extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event19_RoyalPardon';
    $this->title = clienttranslate('Royal Pardon');
    $this->titleLight = clienttranslate('Empty promise');
    $this->textLight = clienttranslate('Place half Merry Men from Prison (rounded down) in a space adjacent to Nottingham, Revealed.');
    $this->titleDark = clienttranslate('A chance for peace');
    $this->textDark = clienttranslate('Release any number of Merry Men from Prison to Available, then shift one step towards Order for every 2 released in this way.');
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
      'action' => EVENT_ROYAL_PARDON_LIGHT,
      'playerId' => $player->getId(),
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
    return Forces::countInLocation(PRISON) > 0;
  }

  public function canPerformDarkEffect($player)
  {
    return Forces::countInLocation(PRISON) > 0;
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

  public function resolveDarkEffect($player, $ctx, $forces)
  {
    foreach ($forces as $force) {
      $force->returnToSupply($player);
    }
    $steps = floor(count($forces) / 2);
    if ($steps > 0) {
      Players::moveRoyalFavour($player, $steps, ORDER);
    }
  }

  public function getDarkStateArgs()
  {
    $forces = $this->getDarkOptions();
    return [
      '_private' => [
        'forces' => $forces,
        'min' => 1,
        'max' => count($forces),
        'type' => 'public',
      ],
      'title' => clienttranslate('${you} may select Merry Men to release from Prison'),
      'confirmText' => clienttranslate('Release ${count} Merry Men?'),
      'titleOther' => clienttranslate('${actplayer} may release Merry Men from Prison'),
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
    $forces = Forces::getInLocation(PRISON)->toArray();

    return $forces;
  }
}
