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

class Event06_PrioressOfKirklees extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event06_PrioressOfKirklees';
    $this->title = clienttranslate('Prioress of Kirklees');
    $this->titleLight = clienttranslate('Robin\'s cousin provides shelter');
    $this->textLight = clienttranslate('Flip all Merry Men in one Parish to Hidden and shift one step towards Justice.');
    $this->titleDark = clienttranslate('Weakens Robin with poison');
    $this->textDark = clienttranslate('Remove Robin Hood and any one Merry Man in the same space to Available.');
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
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_SELECT_SPACE,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'effect' => LIGHT,
    ]));
  }

  public function resolveDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    // $robinHood = Forces::get(ROBIN_HOOD);

    // $ctx->insertAsBrother(new LeafNode([
    //   'action' => EVENT_SELECT_SPACE,
    //   'playerId' => $player->getId(),
    //   'cardId' => $this->id,
    //   'effect' => DARK,
    // ]));
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
      $merryMen = Utils::filter($space->getForces(), function ($force) {
        return $force->isMerryMan() && !$force->isHidden();
      });
      foreach ($merryMen as $merryMan) {
        $merryMan->hide($player);
      }
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
        'title' => clienttranslate('${you} must select a Parish'),
        'confirmText' => clienttranslate('Flip all Merry Men in ${spaceName} to Hidden?'),
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

  // private function getDarkOptions()
  // {
  //   $forces = Forces::getAll()->toArray();
  //   $parishes = Spaces::getMany(PARISHES)->toArray();

  //   $spaces = [];
  //   foreach ($parishes as $parish) {
  //     if ($parish->isRevolting() && Utils::array_some($forces, function ($force) use ($parish) {
  //       return $force->getLocation() === $parish->getId() && $force->isMerryMan() && !$force->isHidden();
  //     })) {
  //       $spaces[] = $parish;
  //     };
  //   }

  //   return $spaces;
  // }

  private function getLightOptions()
  {
    $forces = Forces::getAll()->toArray();
    $parishes = Spaces::getMany(PARISHES)->toArray();

    $spaces = [];
    foreach ($parishes as $parish) {
      $hasRevealedMerryMan = Utils::array_some($forces, function ($force) use ($parish) {
        return $force->getLocation() === $parish->getId() && $force->isMerryMan() && !$force->isHidden();
      });

      if ($hasRevealedMerryMan) {
        $spaces[] = $parish;
      }
    }

    return $spaces;
  }
}
