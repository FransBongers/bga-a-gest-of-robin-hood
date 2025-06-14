<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;

class Event23_FriarTuck extends \AGestOfRobinHood\Cards\Events\RegularEvent
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
      'action' => DONATE,
      'playerId' => $player->getId(),
      'source' => $this->id,
      'cost' => 1,
      'maxSpaces' => 3,
      'ignoreOutnumberHenchmen' => true,
    ]));
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
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
    return $player->getShillings() > 0 && count(AtomicActions::get(DONATE)->getPossibleSpaces(true)) > 0;
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

  public function resolveDarkEffect($player, $ctx, $space)
  {
    $spaceId = $space->getId();
    $hiddenMerryMen = Utils::filter(Forces::getInLocation($spaceId)->toArray(), function ($merryMan) use ($spaceId) {
      return $merryMan->isHidden() && $merryMan->isMerryMan();
    });
    $checkpoint = Forces::get(ROBIN_HOOD)->isLocationUnknown();
    foreach ($hiddenMerryMen as $merryMan) {
      $merryMan->reveal($player);
    }
    if ($checkpoint) {
      Globals::setCheckpoint(true);
    }
  }

  public function getDarkStateArgs()
  {
    return [
      'spaces' => $this->getDarkOptions(),
      'title' => clienttranslate('${you} must select a space'),
      'confirmText' => clienttranslate('Reveal all Merry Men in ${spaceName}?'),
      'titleOther' => clienttranslate('${actplayer} must select a space'),
    ];
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  public function resolveDarkEffectAutomatically($player, $ctx)
  {
    $options = $this->getDarkOptions();
    if (count($options) > 1) {
      return false;
    }
    $space = $options[0];
    $this->resolveDarkEffect($player, $ctx, $space);
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
