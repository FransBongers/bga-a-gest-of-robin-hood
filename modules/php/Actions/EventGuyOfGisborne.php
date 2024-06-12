<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class EventGuyOfGisborne extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_EVENT_GUY_OF_GISBORNE;
  }

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  // ....###.....######..########.####..#######..##....##
  // ...##.##...##....##....##.....##..##.....##.###...##
  // ..##...##..##..........##.....##..##.....##.####..##
  // .##.....##.##..........##.....##..##.....##.##.##.##
  // .#########.##..........##.....##..##.....##.##..####
  // .##.....##.##....##....##.....##..##.....##.##...###
  // .##.....##..######.....##....####..#######..##....##

  public function stEventGuyOfGisborne()
  {
    $info = $this->ctx->getInfo();
    $effect = $info['effect'];

    if ($effect === LIGHT) {
      return;
    }

    $options = $this->getDarkOptions();
    if (count($options['monkInDeck']) > 0 && count($options['monkInDiscard']) > 0) {
      return;
    }
    $card = null;
    if (count($options['monkInDeck']) > 0) {
      $card = $options['monkInDeck'][0];
    } else if (count($options['monkInDiscard']) > 0) {
      $card = $options['monkInDiscard'][0];
    }
    $this->resolveDarkOption(self::getPlayer(), $card);

    $this->resolveAction(['automatic' => true]);
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventGuyOfGisborne()
  {

    $data = [];

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

  public function actPassEventGuyOfGisborne()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actEventGuyOfGisborne($args)
  {
    self::checkAction('actEventGuyOfGisborne');


    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  public function resolveDarkOption($player, $card)
  {
    if ($card !== null) {
      $card->removeFromGame($player);
    }
    Cards::shuffle(TRAVELLERS_DECK);
    Notifications::shuffleTravellersDeck($player);
  }

  public function getDarkOptions()
  {
    return [
      'monkInDeck' => Utils::filter(Cards::getInLocation(TRAVELLERS_DECK)->toArray(), function ($card) {
        return in_array($card->getId(), MONK_IDS);
      }),
      'monkInDiscard' => Utils::filter(Cards::getInLocation(TRAVELLERS_DISCARD)->toArray(), function ($card) {
        return in_array($card->getId(), MONK_IDS);
      }),
    ];
  }
}
