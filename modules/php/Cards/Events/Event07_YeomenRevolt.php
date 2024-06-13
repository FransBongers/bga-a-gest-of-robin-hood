<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;

class Event07_YeomenRevolt extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event07_YeomenRevolt';
    $this->title = clienttranslate('Yeomen Revolt');
    $this->titleLight = clienttranslate('Revolt encouraged');
    $this->textLight = clienttranslate('Set a Parish without Henchmen to Revolting and shift one step towards Justice.');
    $this->titleDark = clienttranslate('Revolt suppressed');
    $this->textDark = clienttranslate('If there are more Submissive Parishes than Revolting Parishes, shift one step towards Order.');
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
    $parishes = Spaces::get(PARISHES)->toArray();
    $submissiveCount = count(Utils::filter($parishes, function ($space) {
      return $space->isSubmissive();
    }));
    $revoltingCount = count(Utils::filter($parishes, function ($space) {
      return $space->isRevolting();
    }));
    if ($submissiveCount > $revoltingCount) {
      Players::moveRoyalFavour($player, 1, ORDER);
    }
  }

  public function canPerformLightEffect($player)
  {
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

  public function resolveEffectAutomatically($player, $effect, $ctx)
  {
    if ($effect === LIGHT) {
      return $this->resolveLightEffectAutomatically($player, $ctx);
    }
    return false;
  }

  public function resolveEffect($player, $effect, $space, $ctx)
  {
    if ($effect === LIGHT && $space !== null) {
      $space->revolt($player);
    }
    if ($effect === LIGHT) {
      Players::moveRoyalFavour($player, 1, JUSTICE);
    }
  }

  public function getStateArgs($effect)
  {
    if ($effect === LIGHT) {
      return [
        'spaces' => $this->getLightOptions(),
        'title' => clienttranslate('${you} must select a Parish to set to Revolting'),
        'confirmText' => clienttranslate('Set ${spaceName} to Revolting?'),
        'titleOther' => clienttranslate('${actplayer} must select a Parish'),
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
    $spaces = $this->getLightOptions();
    if (count($spaces) === 0) {
      $this->resolveEffect($player, LIGHT, null, $ctx);
      return true;
    } else if (count($spaces) === 1) {
      $this->resolveEffect($player, LIGHT, $spaces[0], $ctx);
      return true;
    }
    return false;
  }

  private function getLightOptions()
  {
    $forces = Forces::getAll()->toArray();
    $parishes = Spaces::getMany(PARISHES)->toArray();

    $spaces = [];
    foreach ($parishes as $parish) {
      if (!$parish->isSubmissive()) {
        continue;
      }
      $doesNotHaveHenmchmen = count(Utils::filter($forces, function ($force) use ($parish) {
        return $force->getLocation() === $parish->getId() && $force->isHenchman();
      })) === 0;

      if ($doesNotHaveHenmchmen) {
        $spaces[] = $parish;
      }
    }

    return $spaces;
  }
}
