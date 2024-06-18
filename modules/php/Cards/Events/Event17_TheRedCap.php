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
    $robinHood = Forces::get(ROBIN_HOOD);
    $robinHood->reveal($player);

    if (count($this->getLightOptions()) > 0) {
      $ctx->insertAsBrother(new LeafNode([
        'action' => EVENT_SELECT_SPACE,
        'playerId' => $player->getId(),
        'cardId' => $this->id,
        'effect' => LIGHT,
      ]));
    } else {
      $this->resolveLightEffect($player, $ctx, null);
    }
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $robinHood->eventRevealBySheriff($player);

    if (in_array($robinHood->getLocation(), SPACES) && count($this->getDarkOptions()) > 0) {
      $ctx->insertAsBrother(new LeafNode([
        'action' => EVENT_SELECT_FORCES,
        'playerId' => $player->getId(),
        'cardId' => $this->id,
        'effect' => DARK,
        'optional' => true,
      ]));
    }
  }

  public function canPerformLightEffect($player)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    if (!$robinHood->isHidden() || in_array($robinHood->getLocation(), [PRISON, ROBIN_HOOD_SUPPLY])) {
      return false;
    }
    return true;
  }

  public function canPerformDarkEffect($player)
  {
    return true;
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

  public function resolveLightEffectAutomatically($player, $ctx)
  {
    $spaces = $this->getLightOptions();
    if (count($spaces) === 1) {
      $this->resolveLightEffect($player, $ctx, $spaces[0]);
      return true;
    }
    return false;
  }

  public function resolveLightEffect($player, $ctx, $space)
  {
    if ($space !== null) {
      $space->revolt($player);
    }
    Players::moveRoyalFavour($player, 1, JUSTICE);
  }

  public function resolveDarkEffect($player, $ctx, $forces)
  {
    $robinHood = Forces::get(ROBIN_HOOD);

    $toSpaceId = $robinHood->getLocation();
    $toSpace = Spaces::get($toSpaceId);

    $moves = [];

    foreach ($forces as $force) {
      $fromSpaceId = $force->getLocation();
      $force->setLocation($toSpaceId);
      if (isset($moves[$fromSpaceId])) {
        $moves[$fromSpaceId][] = $force;
      } else {
        $moves[$fromSpaceId] = [$force];
      }
    }

    foreach ($moves as $fromSpaceId => $forces) {
      Notifications::moveForces($player, Spaces::get($fromSpaceId), $toSpace, $forces);
    }
  }

  public function getLightStateArgs()
  {
    return [
      'spaces' => $this->getLightOptions(),
      'title' => clienttranslate('${you} must select a Parish'),
      'confirmText' => clienttranslate('Set ${spaceName} to Revolting?'),
      'titleOther' => clienttranslate('${actplayer} must select a Parish'),
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
        'type' => 'private',
      ],
      'title' => clienttranslate('${you} may select Henchmen to move (${count} remaining)'),
      'confirmText' => clienttranslate('Move Henchmen to Robin Hood\'s space?'),
      'titleOther' => clienttranslate('${actplayer} may move Henchmen to Robin Hood\'s space'),
    ];
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
    $robinHood = Forces::get(ROBIN_HOOD);
    $adjacentSpaces = Spaces::get($robinHood->getLocation())->getAdjacentSpaces();
    return Utils::filter($adjacentSpaces, function ($space) {
      return $space->isSubmissive() && in_array($space->getId(), PARISHES);
    });
  }

  private function getDarkOptions()
  {
    $henchmen = Forces::getOfType(HENCHMEN);

    return Utils::filter($henchmen, function ($henchman) {
      return in_array($henchman->getLocation(), SPACES);
    });
  }
}
