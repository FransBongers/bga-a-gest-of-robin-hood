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

class Event10_TaxCollectors extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event10_TaxCollectors';
    $this->title = clienttranslate('Tax Collectors');
    $this->titleLight = clienttranslate('Incompetent administrators');
    $this->textLight = clienttranslate('Move up to 4 Merry Men from adjacent spaces into Nottingham, flip them Hidden, then may attempt a Rob there.');
    $this->titleDark = clienttranslate('Brutal enforcement');
    $this->textDark = clienttranslate('Confiscate in up to two Parishes, even if Revolting.');
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
    ]));
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => CONFISCATE,
      'playerId' => $player->getId(),
      'source' => $this->id,
      'allowNotSubmissive' => true,
    ]));
  }

  public function canPerformLightEffect($player)
  {
    return count($this->getLightOptions()) > 0 || Utils::array_some(Spaces::get(NOTTINGHAM)->getForces(), function ($force) {
      return $force->isMerryMan() && $force->isHidden();
    });
  }

  public function canPerformDarkEffect($player)
  {
    $confiscate = AtomicActions::get(CONFISCATE);
    return count($confiscate->getAvailableCarriageTypes()) > 0 && count($confiscate->getOptions(true)) > 0;
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
    $input = array_map(function ($force) {
      return [
        'force' => $force,
        'toSpaceId' => NOTTINGHAM,
        'toHidden' => true,
      ];
    }, $forces);
    $notifData = GameMap::createMoves($input);
    Notifications::taxCollectorsLight($player, $notifData['forces'], $notifData['moves']);

    $robOptions = AtomicActions::get(ROB)->getOptions();

    if (isset($robOptions[NOTTINGHAM])) {
      $ctx->insertAsBrother(new LeafNode([
        'action' => ROB,
        'playerId' => $player->getId(),
        'source' => $this->id,
        'spaceIds' => [NOTTINGHAM],
        'optional' => true,
      ]));
    }
  }

  public function getLightStateArgs()
  {
    return [
      '_private' => [
        'forces' => $this->getLightOptions(),
        'min' => 0,
        'max' => 4,
        'type' => 'private',
      ],
      'title' => clienttranslate('${you} may select Merry Men to move into Nottingham (${count} remaining)'),
      'confirmText' => clienttranslate('Move Merry Men into Nottingham?'),
      'titleOther' => clienttranslate('${actplayer} may move Merry Men into Nottingham'),
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

  public function getLightOptions()
  {
    $nottingham = Spaces::get(NOTTINGHAM);
    $adjacentSpaceIds = $nottingham->getAdjacentSpaceIds();
    $forces = Forces::getAll()->toArray();
    return Utils::filter($forces, function ($force) use ($adjacentSpaceIds) {
      return $force->isMerryMan() && in_array($force->getLocation(), $adjacentSpaceIds);
    });
  }
}
