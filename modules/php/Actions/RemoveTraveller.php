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


class RemoveTraveller extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_REMOVE_TRAVELLER;
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

  public function stRemoveTraveller()
  {
    $options = $this->getOptions();

    if (count($options['cards']) === 0) {
      $this->checkShuffle();
      $this->resolveAction(['automatic' => true]);
      return;
    }

    $player = self::getPLayer();
    $to = $options['to'];
    if (count($options['from']) === 1 && count($to) === 1) {
      $card = $options['cards'][0];

      if ($to[0] === REMOVED_FROM_GAME) {
        $card->removeFromGame($player);
      }
      if ($to[0] === TRAVELLERS_VICTIMS_PILE) {
        $card->setLocation(TRAVELLERS_VICTIMS_PILE);
        Notifications::putCardInVictimsPile(self::getPlayer(), $card);
      }
      $this->checkShuffle();
      $this->resolveAction(['automatic' => true]);
      return;
    }
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsRemoveTraveller()
  {
    $options = $this->getOptions();

    $data = [
      'from' => $options['from'],
      'cardType' => $options['cardType'],
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

  public function actPassRemoveTraveller()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actRemoveTraveller($args)
  {
    self::checkAction('actRemoveTraveller');
    $from = $args['from'];
    $toArg = isset($args['to']) ? $args['to'] : null;

    $options = $this->getOptions();

    $card = Utils::array_find($options['cards'], function ($card) use ($from) {
      return $card->getLocation() === $from;
    });

    if ($card === null) {
      throw new \feException("ERROR 062");
    }

    if ($toArg === null && count($options['to']) > 1) {
      throw new \feException("ERROR 063");
    }

    $player = self::getPlayer();
    $to = $options['to'];
    if ($to[0] === REMOVED_FROM_GAME) {
      $card->removeFromGame($player);
    }
    // TODO: remove to victims pile
    $this->checkShuffle();

    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private function checkShuffle()
  {
    $info = $this->ctx->getInfo();
    $shuffle = $info['shuffle'];
    foreach ($shuffle as $cardLocation) {
      Cards::shuffle($cardLocation);
    }
  }

  private function getOptions()
  {
    $info = $this->ctx->getInfo();
    $from = $info['from'];
    $to = $info['to'];
    $cardType = $info['cardType'];

    $cards = [];
    $locations = [];

    foreach ($from as $fromLocation) {
      $cardsInLocation = Utils::filter(Cards::getInLocation($fromLocation)->toArray(), function ($card) use ($cardType) {
        if ($cardType === MONK) {
          return in_array($card->getId(), MONK_IDS);
        }
        if ($cardType === KNIGHT) {
          return in_array($card->getId(), KNIGHT_IDS);
        }
        return false;
      });

      if (count($cardsInLocation) > 0) {
        $cards = array_merge($cards, $cardsInLocation);
        $locations[] = $fromLocation;
      }
    }

    return [
      'cards' => $cards,
      'from' => $locations,
      'to' => $to,
      'cardType' => $cardType,
    ];
  }
}
