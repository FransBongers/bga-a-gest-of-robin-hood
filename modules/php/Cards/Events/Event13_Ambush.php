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

class Event13_Ambush extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event13_Ambush';
    $this->title = clienttranslate('Ambush');
    $this->titleLight = clienttranslate('Perfect hiding places');
    $this->textLight = clienttranslate('Move any number of Merry Men to a space with a Carriage, flip them Hidden, and attempt a Rob there now.');
    $this->titleDark = clienttranslate('Easy to detect');
    $this->textDark = clienttranslate('Reveal all Merry Men in a Forest and shift one step towards Order.');
    $this->carriageMoves = 1;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }

  // public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  // {
  //   $ctx->insertAsBrother(new LeafNode([
  //     'action' => EVENT_AMBUSH_DARK,
  //     'playerId' => $player->getId(),
  //     'cardId' => $this->getId(),
  //   ]));
  // }


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
      'action' => EVENT_AMBUSH_LIGHT,
      'playerId' => $player->getId(),
      'cardId' => $this->id,
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
    $carriagesOnMap = Utils::filter(Forces::getAll()->toArray(), function ($force) {
      return in_array($force->getLocation(), SPACES) && in_array($force->getType(), CARRIAGE_TYPES);
    });
    return count($carriagesOnMap) > 0;
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
    $forces = Forces::getInLocation($spaceId)->toArray();

    foreach ($forces as $force) {
      if ($force->isMerryMan() && $force->isHidden()) {
        $force->reveal($player);
      }
    }

    Players::moveRoyalFavour($player, 1, ORDER);
  }

  public function getDarkStateArgs()
  {
    return [
      'spaces' => $this->getLightOptions(),
      'title' => clienttranslate('${you} must select a Forest'),
      'confirmText' => clienttranslate('Reveal all Merry Men in in ${spaceName}?'),
      'titleOther' => clienttranslate('${actplayer} must select a Forest'),
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

  private function getLightOptions()
  {
    return Spaces::get([SOUTHWELL_FOREST, SHIRE_WOOD])->toArray();
  }

  private function getDarkOptions()
  {
    $options = [];
    foreach ([SHIRE_WOOD, SOUTHWELL_FOREST] as $spaceId) {
      $options[$spaceId] = Utils::array_some(Forces::getInLocation($spaceId)->toArray(), function ($force) {
        return $force->isMerryMan() && $force->isHidden();
      });
    }
    return $options;
  }
}
