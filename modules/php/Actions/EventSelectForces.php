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


class EventSelectForces extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_EVENT_SELECT_FORCES;
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

  public function stEventSelectForces()
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

  public function argsEventSelectForces()
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

    return [
      '_private' => [
        $this->ctx->getPlayerId() => $data['_private']
      ],
      'title' => $data['title'],
      'confirmText' => $data['confirmText'],
      'titleOther' => $data['titleOther'],
    ];
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

  public function actPassEventSelectForces()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actEventSelectForces($args)
  {
    self::checkAction('actEventSelectForces');
    $selectedForcesIds = $args['selectedForcesIds'];

    $info = $this->ctx->getInfo();
    $cardId = $info['cardId'];
    $effect = $info['effect'];
    $card = Cards::get($cardId);

    $data = [];
    if ($effect === LIGHT) {
      $data = Cards::get($cardId)->getLightStateArgs($effect);
    } else if ($effect === DARK) {
      $data = Cards::get($cardId)->getDarkStateArgs($effect);
    }

    $options = $data['_private'];
    $selectedForces = [];

    foreach($selectedForcesIds as $forceId) {
      $force = Utils::array_find($options['forces'], function ($force) use ($forceId) {
        return $force->getId() === $forceId;
      });
      if ($force === null) {
        throw new \feException("ERROR 075");
      }
      $selectedForces[] = $force;
    }

    if ($effect === LIGHT) {
      $card->resolveLightEffect(self::getPlayer(), $this->ctx, $selectedForces);
    } else if ($effect === DARK) {
      $card->resolveDarkEffect(self::getPlayer(), $this->ctx, $selectedForces);
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
