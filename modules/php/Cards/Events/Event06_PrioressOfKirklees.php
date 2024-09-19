<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Log;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;

class Event06_PrioressOfKirklees extends \AGestOfRobinHood\Cards\Events\RegularEvent
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
    $this->clarificationDark = [
      clienttranslate('This will reveal Robin Hood if he is Hidden.')
    ];
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
      'action' => EVENT_SELECT_SPACE,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'effect' => LIGHT,
    ]));
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $checkpoint = $robinHood->isHidden() || $robinHood->getLocation() === ROBIN_HOOD_SUPPLY;
    $robinHood->eventRevealBySheriff($player);

    if ($robinHood->getLocation() !== ROBIN_HOOD_SUPPLY) {
      $ctx->insertAsBrother(new LeafNode([
        'action' => EVENT_SELECT_FORCES,
        'playerId' => $player->getId(),
        'cardId' => $this->id,
        'effect' => DARK,
        'optional' => true,
      ]));
    }

    if ($checkpoint) {
      // Log::checkpoint();
      Globals::setCheckpoint(true);
    }
  }

  public function canPerformLightEffect($player)
  {
    return true;
  }

  public function canPerformDarkEffect($player)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    return !in_array($robinHood->getLocation(), [PRISON, REMOVED_FROM_GAME]);
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

  public function resolveLightEffect($player, $ctx, $space)
  {
    if ($space !== null) {
      $merryMen = Utils::filter($space->getForces(), function ($force) {
        return $force->isMerryMan() && !$force->isHidden();
      });
      foreach ($merryMen as $merryMan) {
        $merryMan->hide($player);
      }
    }

    Players::moveRoyalFavour($player, 1, JUSTICE);
  }


  public function getLightStateArgs()
  {
    return [
      'spaces' => $this->getLightOptions(),
      'title' => clienttranslate('${you} must select a Parish'),
      'confirmText' => clienttranslate('Flip all Merry Men in ${spaceName} to Hidden?'),
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
        'max' => 1,
        'type' => 'public',
        'showSelected' => [Forces::get(ROBIN_HOOD)],
      ],
      'title' => clienttranslate('${you} may select one Merry Men to remove to Available'),
      'confirmText' => clienttranslate('Remove Robin Hood and Merry Man to Available?'),
      'titleOther' => clienttranslate('${actplayer} may remove one Merry Man'),
      'passButtonText' => clienttranslate('Remove Robin Hood only'),
    ];
  }

  public function resolveDarkEffect($player, $ctx, $forces)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $robinHood->returnToSupply($player);
    foreach ($forces as $merryMan) {
      $merryMan->returnToSupply($player);
    }
  }

  public function resolveDarkPass($player, $ctx)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $robinHood->returnToSupply($player);
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
    $spaces = $this->getLightOptions();
    if (count($spaces) === 0) {
      $this->resolveLightEffect($player, $ctx, null);
      return true;
    } else if (count($spaces) === 1) {
      $this->resolveLightEffect($player, $ctx, $spaces[0]);
      return true;
    }
    return false;
  }

  public function resolveDarkEffectAutomatically($player, $ctx)
  {
    $merryMen = $this->getDarkOptions();
    if (count($merryMen) === 0) {
      $this->resolveDarkEffect($player, $ctx, $merryMen);
      return true;
    }
    return false;
  }

  private function getDarkOptions()
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $space = Spaces::get($robinHood->getLocation());

    return Utils::filter($space->getForces(), function ($force) {
      return $force->isMerryManNotRobinHood();
    });
  }

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
