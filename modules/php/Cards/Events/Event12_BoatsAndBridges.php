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

class Event12_BoatsAndBridges extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event12_BoatsAndBridges';
    $this->title = clienttranslate('Boats & Bridges');
    $this->titleLight = clienttranslate('Crafting boats');
    $this->textLight = clienttranslate('Move any number of Merry Men from one space adjacent to a River to one other space adjacent to a River, then hide all moved Merry Men.');
    $this->titleDark = clienttranslate('Building bridges');
    $this->textDark = clienttranslate('Place the Bridge across any River border, which is now treated as a regular border. Shift one step towards Order.');
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
      'action' => EVENT_BOATS_BRIDGES_LIGHT,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
    ]));
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_BOATS_BRIDGES_DARK,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
    ]));
  }

  public function canPerformLightEffect($player)
  {
    return count(AtomicActions::get(EVENT_BOATS_BRIDGES_LIGHT)->getOptions()) > 0;
  }
}
