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

    $input = $data['_private'];
    if ($input['type'] === 'public') {
      $input['forces'] = array_map(function ($force) {
        return GameMap::createPublicForce($force);
      }, $input['forces']);

      if (isset($input['showSelected'])) {
        $input['showSelected'] = array_map(function ($force) {
          return GameMap::createPublicForce($force);
        }, $input['showSelected']);
      }
    }


    return [
      '_private' => [
        $this->ctx->getPlayerId() => $input,
      ],
      'title' => $data['title'],
      'confirmText' => $data['confirmText'],
      'titleOther' => $data['titleOther'],
      'passButtonText' => isset($data['passButtonText']) ? $data['passButtonText'] : null,
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
    $info = $this->ctx->getInfo();
    $cardId = $info['cardId'];
    $effect = $info['effect'];
    $card = Cards::get($cardId);

    if ($effect === LIGHT) {
      $card->resolveLightPass($player, $this->ctx);
    } else if ($effect === DARK) {
      $card->resolveDarkPass($player, $this->ctx);
    }
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actEventSelectForces($args)
  {
    self::checkAction('actEventSelectForces');
    $selectedForcesArgs = $args['selectedForces'];

    $info = $this->ctx->getInfo();
    $cardId = $info['cardId'];
    $effect = $info['effect'];
    $card = Cards::get($cardId);

    $data = [];
    if ($effect === LIGHT) {
      $data = $card->getLightStateArgs();
    } else if ($effect === DARK) {
      $data = $card->getDarkStateArgs();
    }

    $options = $data['_private'];
    $selectedForces = [];

    if ($options['type'] === 'private') {
      $selectedForces = $this->getSelectedForcesPrivate($selectedForcesArgs, $options['forces']);
    } else if ($options['type'] === 'public') {
      $selectedForces = $this->getSelectedForcePublic($selectedForcesArgs, $options['forces']);
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

  private function getSelectedForcePublic($selectedForces, $selectableForces)
  {
    $forces = [];

    foreach ($selectedForces as $publicForce) {
      $force = Utils::array_find($selectableForces, function ($selectableForce) use ($forces, $publicForce) {
        $alreadySelected = Utils::array_some($forces, function ($pickedForce) use ($selectableForce) {
          return $selectableForce->getId() === $pickedForce->getId();
        });
        if ($alreadySelected) {
          return false;
        }
        $publicTypeMatches = GameMap::getPublicForceType($selectableForce->getType(), $selectableForce->isHidden()) === $publicForce['type'];
        $hiddenMatches = $selectableForce->isHidden() === $publicForce['hidden'];
        $locationMatches = $selectableForce->getLocation() === $publicForce['spaceId'];
        return $publicTypeMatches && $hiddenMatches && $locationMatches;
      });
      if ($force === null) {
        throw new \feException("ERROR 076");
      }
      $forces[] = $force;
    }

    return $forces;
  }

  private function getSelectedForcesPrivate($selectedForcesIds, $forces)
  {
    foreach ($selectedForcesIds as $forceId) {
      $force = Utils::array_find($forces, function ($force) use ($forceId) {
        return $force->getId() === $forceId;
      });
      if ($force === null) {
        throw new \feException("ERROR 075");
      }
      $selectedForces[] = $force;
    }
  }
}
