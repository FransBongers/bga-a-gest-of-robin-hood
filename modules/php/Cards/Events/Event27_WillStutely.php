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

class Event27_WillStutely extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event27_WillStutely';
    $this->title = clienttranslate('Will Stutely');
    $this->titleLight = clienttranslate('A cunning ruse');
    $this->textLight = clienttranslate('Move a Hidden Merry Man to a Parish from an adjacent space, then move all Henchmen there to Nottingham.');
    $this->titleDark = clienttranslate('To the gallows!');
    $this->textDark = clienttranslate('Place any two Revealed Merry Men in Prison (not Robin Hood).');
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
    // $ctx->insertAsBrother(new LeafNode([
    //   'action' => EVENT_SELECT_FORCES,
    //   'playerId' => $player->getId(),
    //   'cardId' => $this->id,
    //   'effect' => LIGHT,
    // ]));
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
    return false;
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

  public function resolveDarkEffect($player, $ctx, $forces)
  {
    $input = array_map(function ($force) {
      return [
        'force' => $force,
        'toSpaceId' => PRISON,
        'toHidden' => false,
      ];
    }, $forces);
    $notifData = GameMap::createMoves($input);
    Notifications::willStutelyDark($player, $notifData['forces'], $notifData['moves']);
  }

  public function getDarkStateArgs()
  {
    $forces = $this->getDarkOptions();
    return [
      '_private' => [
        'forces' => $forces,
        'min' => 0,
        'max' => min(2, count($forces)),
        'type' => 'public'
      ],
      'title' => clienttranslate('${you} may select Revealed Merry Men to place in Prison (${count} remaining)'),
      'confirmText' => clienttranslate('Place Merry Men in Prison?'),
      'titleOther' => clienttranslate('${actplayer} may place revealed Merry Men in Prison'),
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

  private function getDarkOptions()
  {
    $merryMen = Forces::getOfType(MERRY_MEN);
    return Utils::filter($merryMen, function ($merryMan) {
      return !$merryMan->isHidden() && in_array($merryMan->getLocation(), SPACES);
    });
  }
}
