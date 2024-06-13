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

class Event15_WillScarlet extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event15_WillScarlet';
    $this->title = clienttranslate('Will Scarlet');
    $this->titleLight = clienttranslate('Talented woodsman');
    $this->textLight = clienttranslate('Place a Camp in one Forest (and shift one step towards Justice), even if there is already a Camp there.');
    $this->titleDark = clienttranslate('Robin\'s resentful kinsman');
    $this->textDark = clienttranslate('Reveal Robin Hood and perform a free Single Patrol.');
    $this->carriageMoves = 2;
    $this->eventType = REGULAR_EVENT;
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

  public function resolveLightEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_SELECT_SPACE,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'effect' => LIGHT,
    ]));
  }

  public function resolveDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $robinHood->eventRevealBySheriff($player);

    $patrol = AtomicActions::get(PATROL);
    if (count($patrol->getOptions()) > 0) {
      $ctx->insertAsBrother(new LeafNode([
        'action' => PATROL,
        'playerId' => $player->getId(),
        'cost' => 0,
        'source' => $this->id,
      ]));
    }
  }

  public function canPerformLightEffect($player)
  {
    return Forces::countInLocation(CAMPS_SUPPLY) > 0;
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

  public function resolveEffectAutomatically($player, $effect, $ctx)
  {
    if ($effect === LIGHT) {
      return $this->resolveLightEffectAutomatically($player, $ctx);
    }
    return false;
  }

  public function resolveEffect($player, $effect, $space, $ctx)
  {
    if ($effect === LIGHT) {
      GameMap::placeCamp($player, $space);
    }
  }

  public function getStateArgs($effect)
  {
    if ($effect === LIGHT) {
      return [
        'spaces' => $this->getLightOptions(),
        'title' => clienttranslate('${you} must select a Forest'),
        'confirmText' => clienttranslate('Place a Camp in ${spaceName}?'),
        'titleOther' => clienttranslate('${actplayer} must select a Forest'),
      ];
    } else if ($effect === DARK) {
    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  private function resolveLightEffectAutomatically($player, $ctx)
  {
    return false;
  }

  private function getLightOptions()
  {
    return Spaces::get([SOUTHWELL_FOREST, SHIRE_WOOD])->toArray();
  }
}
