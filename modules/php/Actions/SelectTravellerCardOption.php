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
    $card = Cards::getTopOf(TRAVELLER_ROBBED);
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

    if (!in_array($option, [DARK, LIGHT])) {
      throw new \feException("ERROR 031");
    }

    $stateArgs = $this->argsSelectTravellerCardOption();

    $card = $stateArgs['card'];
    $player = self::getPlayer();

    if ($option === DARK && !$card->canPerformDarkEffect($player)) {
      throw new \feException("ERROR 100");
    }
    if ($option === LIGHT && !$card->canPerformLightEffect($player)) {
      throw new \feException("ERROR 101");
    }

    Notifications::selectedTravellerOption($player, $card, $option);

    $info = $this->ctx->getInfo();
    $spaceId = $info['spaceId'];
    $merryMenIds = $info['merryMenIds'];

    $space = Spaces::get($spaceId);

    $success = false;

    if ($card->requiresRoll($option)) {
      $strength = $card->getStrength();

      $dieColor = $space->isRevolting() || $space->isForest() ? GREEN : WHITE;
      $dieResult = $dieColor === GREEN ? GestDice::rollGreenDie() : GestDice::rollWhiteDie();

      $henchmenInSpace = count(Utils::filter($space->getForces(), function ($force) {
        return $force->isHenchman();
      }));
      $source = isset($info['source']) ? $info['source'] : null;
      $modifier = $source === 'Event22_FastCarriages' ? 1 : 0;
      $robinHoodResult = count($merryMenIds) + $dieResult + $modifier;
      $sheriffResult = $henchmenInSpace + $strength;
      $success = $robinHoodResult  > $sheriffResult;
      Notifications::robResult($player, $dieColor, $dieResult, $success, $robinHoodResult, $sheriffResult);
    } else {
      $success = true;
      // Notifications::resolveRobEffect($player, $option === 'dark' ? $card->getTitleDark() : $card->getTitleLight());
    }

    if ($option === 'light') {
      $card->performLightEffect($player, $success, $this->ctx, $space, $merryMenIds);
    } else if ($option === 'dark') {
      $card->performDarkEffect($player, $success, $this->ctx, $space, $merryMenIds);
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
