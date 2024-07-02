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

class Event21_RobinsHorn extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event21_RobinsHorn';
    $this->title = clienttranslate('Robin\'s Horn');
    $this->titleLight = clienttranslate('An epic robbery');
    $this->textLight = clienttranslate('Reveal Robin Hood to move up to 3 Merry Men from adjacent spaces into his space, Hidden. Then, may attempt a Rob there.');
    $this->titleDark = clienttranslate('A common thief');
    $this->textDark = clienttranslate('Place Henchmen up to half the number of cards in the Victims Pile (rounded up) in any Parishes, then may Capture in one Parish where a Henchman was placed.');
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

    if (count($this->getLightOptions()) > 0) {
      $ctx->insertAsBrother(new LeafNode([
        'action' => EVENT_SELECT_FORCES,
        'playerId' => $player->getId(),
        'cardId' => $this->id,
        'effect' => LIGHT,
        'optional' => true,
      ]));
    } else {
      $ctx->insertAsBrother(new LeafNode([
        'action' => ROB,
        'playerId' => $player->getId(),
        'cardId' => $this->id,
        'spaceIds' => [
          $robinHood->getLocation(),
        ],
        'optional' => true,
      ]));
    }
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => PLACE_HENCHMEN,
      'playerId' => $player->getId(),
      'maxNumber' => ceil(Cards::countInLocation(TRAVELLERS_VICTIMS_PILE) / 2),
      'locationIds' => PARISHES,
      'cardId' => $this->id,
    ]));
  }

  public function canPerformLightEffect($player)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    return $robinHood->isHidden() && in_array($robinHood->getLocation(), SPACES);
  }

  public function canPerformDarkEffect($player)
  {
    return Cards::countInLocation(TRAVELLERS_VICTIMS_PILE) > 0 && Forces::countInLocation(HENCHMEN_SUPPLY) > 0;
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

  public function resolveLightPass($player, $ctx)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $ctx->insertAsBrother(new LeafNode([
      'action' => ROB,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'spaceIds' => [
        $robinHood->getLocation(),
      ],
      'optional' => true,
    ]));
  }

  public function resolveLightEffect($player, $ctx, $forces)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $toSpaceId = $robinHood->getLocation();
    $data = GameMap::createMoves(array_map(function ($force) use ($toSpaceId) {
      return [
        'force' => $force,
        'toSpaceId' => $toSpaceId,
        'toHidden' => true,
      ];
    }, $forces));

    Notifications::robinsHornLight($player, $data['forces'], $data['moves'], Spaces::get($toSpaceId));

    $ctx->insertAsBrother(new LeafNode([
      'action' => ROB,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'spaceIds' => [
        $robinHood->getLocation(),
      ],
      'optional' => true,
    ]));
  }


  public function getLightStateArgs()
  {
    $forces = $this->getLightOptions();
    return [
      '_private' => [
        'forces' => $forces,
        'min' => 0,
        'max' => min(3, count($forces)),
        'type' => 'private',
      ],
      'title' => clienttranslate('${you} may select Merry Men to move to Robin Hood\'s space (${count} remaining)'),
      'confirmText' => clienttranslate('Move Merry Men?'),
      'titleOther' => clienttranslate('${actplayer} may move Merry Men to move to Robin Hood\'s space'),
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
    $merryMen = Forces::getOfType(MERRY_MEN);
    $spaceIds = Spaces::get(Forces::get(ROBIN_HOOD)->getLocation())->getAdjacentSpaceIds();;
    return Utils::filter($merryMen, function ($merryMan) use ($spaceIds) {
      return in_array($merryMan->getLocation(), $spaceIds);
    });
  }
}
