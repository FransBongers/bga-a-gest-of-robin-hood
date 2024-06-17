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
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class Donate extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_DONATE;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsDonate()
  {
    $info = $this->ctx->getInfo();

    $ignoreOutnumberHenchmen = isset($info['ignoreOutnumberHenchmen']) ?
      $info['ignoreOutnumberHenchmen'] :
      false;

    $possible = $this->getPossibleSpaces($ignoreOutnumberHenchmen);
    $data = [
      'spaces' => $possible,
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

  public function actPassDonate()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actDonate($args)
  {
    self::checkAction('actDonate');

    $spaceId = $args['spaceId'];

    $stateArgs = $this->argsDonate();

    $space = Utils::array_find($stateArgs['spaces'], function ($space) use ($spaceId) {
      return $spaceId === $space->getId();
    });

    if ($space === null) {
      throw new \feException("ERROR 023");
    }

    $player = self::getPlayer();
    $info = $this->ctx->getInfo();

    $cost = isset($info['cost']) ? $info['cost'] : 2;
    $player->payShillings($cost);

    $space->revolt($player);

    $maxSpaces = isset($info['maxSpaces']) ? $info['maxSpaces'] : 2;

    if (
      count(Engine::getResolvedActions([DONATE])) <= $maxSpaces - 2 &&
      count($this->getPossibleSpaces()) > 0 &&
      $player->getShillings() >= $cost
    ) {
      $ignoreOutnumberHenchmen = isset($info['ignoreOutnumberHenchmen']) ?
        $info['ignoreOutnumberHenchmen'] :
        false;

      $this->ctx->insertAsBrother(new LeafNode([
        'action' => DONATE,
        'playerId' => $player->getId(),
        'optional' => true,
        'cost' => $cost,
        'maxSpaces' => $maxSpaces,
        'ignoreOutnumberHenchmen' => $ignoreOutnumberHenchmen
      ]));
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

  public function getName()
  {
    return clienttranslate('Donate');
  }

  public function canBePerformed($player)
  {
    if ($player->getShillings() < 2) {
      return false;
    }

    return count($this->getPossibleSpaces()) > 0;
  }

  public function getPossibleSpaces($ignoreOutnumberHenchmen = false)
  {
    return Utils::filter(Spaces::get(PARISHES)->toArray(), function ($space) use ($ignoreOutnumberHenchmen) {
      if (!$space->isSubmissive()) {
        return false;
      }
      $forces = $space->getForces();
      $numberOfMerryMen = count(Utils::filter($forces, function ($force) {
        return $force->isMerryMan();
      }));
      $numberOfHenchmen = count(Utils::filter($forces, function ($force) {
        return $force->isHenchman();
      }));
      return $numberOfMerryMen > 0 && ($ignoreOutnumberHenchmen || $numberOfMerryMen >= $numberOfHenchmen);
    });
  }
}
