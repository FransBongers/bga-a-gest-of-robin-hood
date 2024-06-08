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
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class Confiscate extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_CONFISCATE;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsConfiscate()
  {
    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => [
          'spaces' => $this->getPossibleSpaces(),
          'availableCarriageTypes' => $this->getAvailableCarriageTypes(),
        ]
      ]
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

  public function actPassConfiscate()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actConfiscate($args)
  {
    self::checkAction('actConfiscate');
    $spaceId = $args['spaceId'];
    $carriageType = $args['carriageType'];

    $spaces = $this->getPossibleSpaces();
    $space = Utils::array_find($spaces, function ($possibleSpace) use ($spaceId) {
      return $possibleSpace->getId() === $spaceId;
    });

    if ($space === null) {
      throw new \feException("ERROR 024");
    }

    $carriages = Forces::getOfTypeInLocation($carriageType, CARRIAGE_SUPPLY);

    if (count($carriages) === 0) {
      throw new \feException("ERROR 025");
    }

    $carriage = $carriages[0];

    $carriage->setLocation($spaceId);
    $player = self::getPlayer();

    Notifications::placeForce($player, $carriage, $space);
    $space->revolt($player);

    if (count(Engine::getResolvedActions([CONFISCATE])) === 0 && $this->canBePerformed($player)) {
      $this->ctx->insertAsBrother(new LeafNode([
        'action' => CONFISCATE,
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
    return clienttranslate('Confiscate');
  }

  public function canBePerformed($player)
  {
    if (count($this->getAvailableCarriageTypes()) === 0) {
      return false;
    }

    return count($this->getPossibleSpaces()) > 0;
  }

  public function getAvailableCarriageTypes()
  {
    return array_values(array_unique(array_map(function ($carriage) {
      return $carriage->getType();
    }, Forces::getInLocation(CARRIAGE_SUPPLY)->toArray())));
  }

  public function getPossibleSpaces()
  {
    $options = [];

    $spaces = Spaces::get(PARISHES);

    foreach ($spaces as $spaceId => $space) {
      if (!$space->isSubmissive()) {
        continue;
      }
      $hasHenchmen = Utils::array_some($space->getForces(), function ($force) {
        return $force->isHenchman();
      });
      if (!$hasHenchmen) {
        continue;
      }
      $options[] = $space;
    }
    return $options;
  }
}
