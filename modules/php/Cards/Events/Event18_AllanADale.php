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

class Event18_AllanADale extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event18_AllanADale';
    $this->title = clienttranslate('Allan-a-dale');
    $this->titleLight = clienttranslate('Flamboyant troubadour');
    $this->textLight = clienttranslate('Reveal any number of Merry Men in one space, gaining one Shilling for each revealed in this way. Shift one step towards Justice.');
    $this->titleDark = clienttranslate('Noisy troublemaker');
    $this->textDark = clienttranslate('Perform a free Single Patrol, automatically Revealing all Merry Men in destination space if at least one Henchman is there.');
    $this->carriageMoves = 2;
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
    if (count($this->getLightOptions()) === 0) {
      Players::moveRoyalFavour($player, 1, JUSTICE);
    } else {
      $ctx->insertAsBrother(new LeafNode([
        'action' => EVENT_SELECT_FORCES,
        'playerId' => $player->getId(),
        'cardId' => $this->id,
        'effect' => LIGHT,
        'optional' => true,
      ]));
    }
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => PATROL,
      'playerId' => $player->getId(),
      'source' => $this->id,
      'cost' => 0,
    ]));
  }

  public function canPerformLightEffect($player)
  {
    return true;
  }

  public function canPerformDarkEffect($player)
  {
    $patrol = AtomicActions::get(PATROL);
    return count($patrol->getOptions()) > 0;
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

  public function resolveLightPass($player, $ctx)
  {
    Players::moveRoyalFavour($player, 1, JUSTICE);
  }

  public function resolveLightEffect($player, $ctx, $forces)
  {
    foreach ($forces as $force) {
      $force->reveal();
    }
    $player->incShillings(count($forces));
    Players::moveRoyalFavour($player, 1, JUSTICE);
  }

  public function resolveDarkEffect($player, $ctx, $forces)
  {
  }

  public function getLightStateArgs()
  {
    $forces = $this->getLightOptions();
    return [
      '_private' => [
        'forces' => $forces,
        'min' => 1,
        'max' => null,
        'type' => 'private',
        'conditions' => [ONE_SPACE]
      ],
      'title' => clienttranslate('${you} may select Merry Men to reveal'),
      'confirmText' => clienttranslate('Reveal ${count} Merry Men?'),
      'titleOther' => clienttranslate('${actplayer} may reveal Merry Men'),
    ];
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...


  private function getLightOptions()
  {
    $forces = Forces::getAll()->toArray();

    return Utils::filter($forces, function ($force) {
      return $force->isMerryMan() && in_array($force->getLocation(), SPACES) && $force->isHidden();
    });
  }
}
