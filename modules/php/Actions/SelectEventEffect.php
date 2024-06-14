<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Spaces\Nottingham;

class SelectEventEffect extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_SELECT_EVENT_EFFECT;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsSelectEventEffect()
  {
    // $action = $this->getSelectedAction();

    // $numberOfSpaces = $action === PLOTS_AND_DEEDS ? 3 : 1;

    $player = self::getPlayer();
    $card = Cards::getTopOf(EVENTS_DISCARD);

    $data = [
      'card' => $card,
      'canPerformDarkEffect' => $card->canPerformDarkEffect($player),
      'canPerformLightEffect' => $card->canPerformLightEffect($player),
    ];

    return $data;
  }

  //  .########..##..........###....##....##.########.########.
  //  .##.....##.##.........##.##....##..##..##.......##.....##
  //  .##.....##.##........##...##....####...##.......##.....##
  //  .########..##.......##.....##....##....######...########.
  //  .##........##.......#########....##....##.......##...##..
  //  .##........##.......##.....##....##....##.......##....##.
  //  .##........########.##.....##....##....########.##.....##

  // ....###.....######..########.####..#######..##....##
  // ...##.##...##....##....##.....##..##.....##.###...##
  // ..##...##..##..........##.....##..##.....##.####..##
  // .##.....##.##..........##.....##..##.....##.##.##.##
  // .#########.##..........##.....##..##.....##.##..####
  // .##.....##.##....##....##.....##..##.....##.##...###
  // .##.....##..######.....##....####..#######..##....##

  public function actPassSelectEventEffect()
  {
    $player = self::getPlayer();

    // Notifications::passAction($player, $shillings);
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actSelectEventEffect($args)
  {
    self::checkAction('actSelectEventEffect');

    $effect = $args['effect'];

    $stateArgs = $this->argsSelectEventEffect();

    if ($effect === 'dark' && !$stateArgs['canPerformDarkEffect']) {
      throw new \feException("ERROR 055");
    }

    if ($effect === 'light' && !$stateArgs['canPerformLightEffect']) {
      throw new \feException("ERROR 056");
    }

    $player = self::getPlayer();
    $card =  $stateArgs['card'];

    Notifications::resolveEventEffect($player, $card, $effect);

    if ($effect === 'dark') {
      $card->performDarkEffect($player, true, $this->ctx);
    } else if ($effect === 'light') {
      $card->performLightEffect($player, true, $this->ctx);
    }



    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

}
