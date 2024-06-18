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

class Event25_WeaponsOfTheWeak extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event25_WeaponsOfTheWeak';
    $this->title = clienttranslate('Weapons of the Weak');
    $this->titleLight = clienttranslate('Passive resistance');
    $this->textLight = clienttranslate('Remove one Submissive marker from the game. That Parish is now neither Submissive nor Revolting, but still counts as Submissive for Rob and Capture Plots.');
    $this->titleDark = clienttranslate('Peasants resigned to oppression');
    $this->textDark = clienttranslate('Set one Revolting Parish to Submissive.');
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
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_SELECT_SPACE,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
      'effect' => DARK,
    ]));
  }

  public function canPerformLightEffect($player)
  {
    return Forces::countInLocation(CAMPS_SUPPLY) > 0;
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

  public function resolveLightEffect($player, $ctx, $space)
  {
    $space->removeSubmissiveMarker($player);
  }

  public function getLightStateArgs()
  {
    return [
      'spaces' => $this->getLightOptions(),
      'title' => clienttranslate('${you} must select a Parish'),
      'confirmText' => clienttranslate('Remove the Submissive marker from ${spaceName} from the game?'),
      'titleOther' => clienttranslate('${actplayer} may remove a Submissive marker from the game'),
    ];
  }

  public function resolveDarkEffect($player, $ctx, $space)
  {
    $space->setToSubmissive($player);
  }

  public function getDarkStateArgs()
  {
    return [
      'spaces' => $this->getDarkOptions(),
      'title' => clienttranslate('${you} must select a Parish'),
      'confirmText' => clienttranslate('Set ${spaceName} to Submissive?'),
      'titleOther' => clienttranslate('${actplayer} may set a Revolting Parish to Submissive'),
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
    $options = $this->getLightOptions();
    if (count($options) === 1) {
      $this->resolveLightEffect($player, $ctx, $options[0]);
      return true;
    }
    return false;
  }

  public function resolveDarkEffectAutomatically($player, $ctx)
  {
    $options = $this->getDarkOptions();
    if (count($options) === 1) {
      $this->resolveDarkEffect($player, $ctx, $options[0]);
      return true;
    }
    return false;
  }

  private function getLightOptions()
  {
    return Utils::filter(Spaces::get(PARISHES)->toArray(), function ($space) {
      return $space->isSubmissive();
    });
  }

  private function getDarkOptions()
  {
    return Utils::filter(Spaces::get(PARISHES)->toArray(), function ($space) {
      return $space->isRevolting();
    });
  }
}
