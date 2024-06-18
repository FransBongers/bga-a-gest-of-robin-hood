<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\GestDice;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class SelectTravellerCardOption extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_SELECT_TRAVELLER_CARD_OPTION;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsSelectTravellerCardOption()
  {
    $card = Cards::getTopOf(TRAVELLERS_DISCARD);
    $player = self::getPlayer();

    $data = [
      'card' => $card,
      'darkOptionAvailable' => $card->canPerformDarkEffect($player),
      'lightOptionAvailable' => $card->canPerformLightEffect($player),
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

  public function actPassSelectTravellerCardOption()
  {
    $player = self::getPlayer();

    // Notifications::passAction($player, $shillings);
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actSelectTravellerCardOption($args)
  {
    self::checkAction('actSelectTravellerCardOption');

    $option = $args['option'];

    if (!in_array($option, ['dark', 'light'])) {
      throw new \feException("ERROR 031");
    }

    $card = Cards::getTopOf(TRAVELLERS_DISCARD);

    $player = self::getPlayer();

    Notifications::selectedTravellerOption($player, $card, $option);

    $info = $this->ctx->getInfo();
    $spaceId = $info['spaceId'];
    $merryMenIds = $info['merryMenIds'];

    $space = Spaces::get($spaceId);
    $strength = $card->getStrength();

    $dieColor = $space->isRevolting() || $space->isForest() ? GREEN : WHITE;
    $dieResult = $dieColor === GREEN ? GestDice::rollGreenDie() : GestDice::rollWhiteDie();

    $henchmenInSpace = count(Utils::filter($space->getForces(), function ($force) {
      return $force->isHenchman();
    }));

    $success = count($merryMenIds) + $dieResult > $henchmenInSpace + $strength;

    if ($card->requiresRoll($option)) {
      Notifications::robResult($player, $dieColor, $dieResult, $success);
    } else {
      Notifications::resolveRobEffect($player, $option === 'dark' ? $card->getTitleDark() : $card->getTitleLight());
    }

    if ($option === 'light') {
      $card->resolveLightEffect($player, $success, $this->ctx, $space);
    } else if ($option === 'dark') {
      $card->resolveDarkEffect($player, $success, $this->ctx, $space);
    }

    $this->resolveAction($args, true);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

}
