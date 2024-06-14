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
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class EventSelectSpace extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_EVENT_SELECT_SPACE;
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

  public function stEventSelectSpace()
  {
    $info = $this->ctx->getInfo();
    $cardId = $info['cardId'];
    $effect = $info['effect'];
    $player = self::getPlayer();

    $isResolved = false;
    if ($effect === LIGHT) {
      $isResolved = Cards::get($cardId)->resolveLightEffectAutomatically($player, $this->ctx);
    } else if ($effect === DARK) {
      $isResolved = Cards::get($cardId)->resolveDarkEffectAutomatically($player, $this->ctx);
    }



    if ($isResolved) {
      $this->resolveAction(['automatic' => true]);
    }
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsEventSelectSpace()
  {
    $info = $this->ctx->getInfo();
    $cardId = $info['cardId'];
    $effect = $info['effect'];

    $data = [];
    if ($effect === LIGHT) {
      $data = Cards::get($cardId)->getLightStateArgs($effect);
    } else if ($effect === DARK) {
      $data = Cards::get($cardId)->getDarkStateArgs($effect);
    }

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

  public function actPassEventSelectSpace()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actEventSelectSpace($args)
  {
    self::checkAction('actEventSelectSpace');
    $spaceId = $args['spaceId'];

    $info = $this->ctx->getInfo();
    $cardId = $info['cardId'];
    $effect = $info['effect'];
    $card = Cards::get($cardId);

    $options = $this->argsEventSelectSpace()['spaces'];

    $space = Utils::array_find($options, function ($option) use ($spaceId) {
      return $option->getId() === $spaceId;
    });

    if ($space === null) {
      throw new \feException("ERROR 074");
    }

    if ($effect === LIGHT) {
      $card->resolveLightEffect(self::getPlayer(), $this->ctx, $space);
    } else if ($effect === DARK) {
      $card->resolveDarkEffect(self::getPlayer(), $this->ctx, $space);
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
