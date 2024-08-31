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

class Event11_GreatEscape extends \AGestOfRobinHood\Cards\Events\RegularEvent
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
      'action' => EVENT_GREAT_ESCAPE_LIGHT,
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

  public function resolveLightEffect($player, $ctx, $space)
  {
    $merryMen = Forces::getInLocation(PRISON)->toArray();
    $robinHood = Forces::get(ROBIN_HOOD);
    if ($robinHood->getLocation() !== PRISON) {
      $merryMen[] = $robinHood;
    }
    // // TODO: check if we can resolve this in the move notif handler
    // $revealRobinHood = $robinHood->getLocation() === $space->getId() && $robinHood->isHidden();
    $notifData = GameMap::createMoves(array_map(function ($merryMan) use ($space) {
      return [
        'force' => $merryMan,
        'toSpaceId' => $space->getId(),
        'toHidden' => false,
      ];
    }, $merryMen));

    Notifications::greatEscapeLight($player, $notifData['forces'], $notifData['moves'], $space);
    // if ($revealRobinHood) {
    //   $robinHood->reveal($player);
    // }
  }

  public function resolveDarkEffect($player, $ctx, $space)
  {
    $hiddenMerryMen = Utils::filter($space->getForces(), function ($force) {
      return $force->isMerryMan() && $force->isHidden();
    });
    $checkpoint = GameMap::isHiddenMerryMenDataRevealed(count($hiddenMerryMen));
    foreach ($hiddenMerryMen as $merryMan) {
      $merryMan->reveal($player);
    }
    $capture = AtomicActions::get(CAPTURE);
    if (Utils::array_some($capture->getOptions(), function ($optionSpace) use ($space) {
      return $optionSpace->getId() === $space->getId();
    })) {
      $capture->resolveCapture($player, $space->getId());
    }
    if ($checkpoint) {
      Globals::setCheckpoint(true);
    }
  }


  public function getLightStateArgs()
  {
    return [
      'spaces' => $this->getLightOptions(),
      'title' => clienttranslate('${you} must select a space adjacent to Nottingham'),
      'confirmText' => clienttranslate('Place Robin Hood and all Merry Men from Prison in ${spaceName}?'),
      'titleOther' => clienttranslate('${actplayer} must select a space adjacent to Nottingham'),
    ];
  }

  public function getDarkStateArgs()
  {
    return [
      'spaces' => $this->getDarkOptions(),
      'title' => clienttranslate('${you} must select a space with Merry Men'),
      'confirmText' => clienttranslate('Reveal all Merry Men in ${spaceName} and Capture there?'),
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
    $spaces = $this->getDarkOptions();
    if (count($spaces) > 1) {
      return false;
    }
    $this->resolveDarkEffect($player, $ctx,  $spaces[0]);
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
