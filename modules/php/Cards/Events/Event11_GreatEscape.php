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

class Event11_GreatEscape extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event11_GreatEscape';
    $this->title = clienttranslate('Great Escape');
    $this->titleLight = clienttranslate('Daring rescue');
    $this->textLight = clienttranslate('Place Robin Hood and all Merry Men from Prison adjacent to Nottingham, Revealed.');
    $this->titleDark = clienttranslate('A traitor in the ranks');
    $this->textDark = clienttranslate('Reveal all Merry Men in one space, then Capture there.');
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
    return count(GameMap::getSpacesWithMerryMen()) > 0;
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
    if ($effect === LIGHT && $space !== null) {
      $space->revolt($player);
    }
    if ($effect === LIGHT) {
      Players::moveRoyalFavour($player, 1, JUSTICE);
    }

    // DARK
    if ($effect === DARK) {
      $this->resolveDarkEffectAfterSelect($player, $space, $ctx);
    }
  }

  public function getStateArgs($effect)
  {
    if ($effect === LIGHT) {
      return [
        'spaces' => $this->getLightOptions(),
        'title' => clienttranslate('${you} must select a space adjacent to Nottingham'),
        'confirmText' => clienttranslate('Place Robin Hood and all Merry Men from Prison in ${spaceName}?'),
        'titleOther' => clienttranslate('${actplayer} must select a space adjacent to Nottingham'),
      ];
    } else if ($effect === DARK) {
      return [
        'spaces' => $this->getDarkOptions(),
        'title' => clienttranslate('${you} must select a space with Merry Men'),
        'confirmText' => clienttranslate('Reveal all Merry Men in ${spaceName} and Capture there?'),
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

  private function resolveDarkEffectAfterSelect($player, $space, $ctx)
  {
    $hiddenMerryMen = Utils::filter($space->getForces(), function ($force) {
      return $force->isMerryMan() && $force->isHidden();
    });
    foreach ($hiddenMerryMen as $merryMan) {
      $merryMan->reveal($player);
    }
    $capture = AtomicActions::get(CAPTURE);
    if (Utils::array_some($capture->getOptions(), function ($optionSpace) use ($space) {
      return $optionSpace->getId() === $space->getId();
    })) {
      $capture->resolveCapture($player, $space->getId());
    }
  }

  private function resolveDarkEffectAutomatically($player, $ctx)
  {
    $spaces = $this->getDarkOptions();
    if (count($spaces) > 1) {
      return false;
    }
    $this->resolveDarkEffectAfterSelect($player, $spaces[0], $ctx);
    return true;
  }

  private function getLightOptions()
  {
    $nottingham = Spaces::get(NOTTINGHAM);

    return $nottingham->getAdjacentSpaces();
  }

  private function getDarkOptions()
  {
    $data = GameMap::getSpacesWithMerryMen();

    $spaces = [];

    foreach ($data as $spaceId => $spaceData) {
      $spaces[] = $spaceData['space'];
    }
    return $spaces;
  }
}
