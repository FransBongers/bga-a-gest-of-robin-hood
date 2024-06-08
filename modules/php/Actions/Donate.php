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
    $possible = $this->getPossibleSpaces();
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

    // if (count($selectedSpaceIds) > $stateArgs['max']) {
    //   throw new \feException("ERROR 023");
    // }

    $space = Utils::array_find($stateArgs['spaces'], function ($space) use ($spaceId) {
      return $spaceId === $space->getId();
    });

    if ($space === null) {
      throw new \feException("ERROR 023");
    }

    $player = self::getPlayer();

    $player->payShillings(2);
    $space->revolt($player);

    if (count(Engine::getResolvedActions([DONATE])) === 0 && $this->canBePerformed($player)) {
      $this->ctx->insertAsBrother(new LeafNode([
        'action' => DONATE,
        'playerId' => $player->getId(),
        'optional' => true,
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

  public function getPossibleSpaces()
  {
    return Utils::filter(Spaces::get(PARISHES)->toArray(), function ($space) {
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
      return $numberOfMerryMen > 0 && $numberOfMerryMen >= $numberOfHenchmen;
    });
  }
}
