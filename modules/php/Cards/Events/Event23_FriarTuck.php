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

class Event23_FriarTuck extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event23_FriarTuck';
    $this->title = clienttranslate('Friar Tuck');
    $this->titleLight = clienttranslate('Popular preacher');
    $this->textLight = clienttranslate('Donate in up to three Parishes where a Merry Man is present, even if there are more Henchmen, paying only 1 Shilling per Parish.');
    $this->titleDark = clienttranslate('Issues with alcohol');
    $this->textDark = clienttranslate('Reveal all Merry Men in one space where a Henchman is present.');
    $this->carriageMoves = 1;
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
    // $ctx->insertAsBrother(new LeafNode([
    //   'action' => EVENT_SELECT_SPACE,
    //   'playerId' => $player->getId(),
    //   'cardId' => $this->id,
    //   'effect' => LIGHT,
    // ]));
  }

  public function resolveDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_SELECT_SPACE,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'effect' => DARK,
    ]));
  }

  public function canPerformLightEffect($player)
  {
    return true;
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

  public function resolveEffectAutomatically($player, $effect, $ctx)
  {
    if ($effect === DARK) {
      return $this->resolveDarkEffectAutomatically($player, $ctx);
    }
    return false;
  }

  public function resolveEffect($player, $effect, $space, $ctx)
  {
    if ($effect === DARK) {
      $spaceId = $space->getId();
      $hiddenMerryMen = Utils::filter(Forces::getInLocation($spaceId)->toArray(), function ($merryMan) use ($spaceId) {
        return $merryMan->isHidden() && $merryMan->isMerryMan();
      });
      foreach($hiddenMerryMen as $merryMan) {
        $merryMan->reveal($player);
      }
    }
  }

  public function getStateArgs($effect)
  {
    if ($effect === LIGHT) {

    } else if ($effect === DARK) {
      return [
        'spaces' => $this->getDarkOptions(),
        'title' => clienttranslate('${you} must select a space'),
        'confirmText' => clienttranslate('Reveal all Merry Men in ${spaceName}?'),
        'titleOther' => clienttranslate('${actplayer} must select a space'),
      ];
    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  private function resolveDarkEffectAutomatically($player, $ctx)
  {
    $options = $this->getDarkOptions();
    if (count($options) > 1) {
      return false;  
    }
    $space = $options[0];
    $this->resolveEffect($player, DARK, $space, $ctx);
    return true;
  }

  private function getDarkOptions()
  {
    $forces = Forces::getAll()->toArray();
    return Utils::filter(Spaces::getAll()->toArray(), function ($space) use ($forces) {
      $spaceId = $space->getId();
      $hasHiddenMerryMen = Utils::array_some($forces, function ($merryMan) use ($spaceId) {
        return $merryMan->getLocation() === $spaceId && $merryMan->isHidden() && $merryMan->isMerryMan();
      });
      if (!$hasHiddenMerryMen) {
        return false;
      }
      return Utils::array_some($forces, function ($force) use ($spaceId) {
        return $force->getLocation() === $spaceId && $force->isHenchman();
      });
    });
  }
}
