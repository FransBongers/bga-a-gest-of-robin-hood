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
    $info = $this->ctx->getInfo();
    $allowNotSubmissive = isset($info['allowNotSubmissive']) ? $info['allowNotSubmissive'] : false;

    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => [
          'spaces' => $this->getOptions($allowNotSubmissive),
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

    $info = $this->ctx->getInfo();
    $allowNotSubmissive = isset($info['allowNotSubmissive']) ? $info['allowNotSubmissive'] : false;

    $spaces = $this->getOptions($allowNotSubmissive);
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
    if ($space->isSubmissive()) {
      $space->revolt($player);
    }
    
    if (count(Engine::getResolvedActions([CONFISCATE])) === 0 && $this->canBePerformed($player, $allowNotSubmissive)) {
      $this->ctx->insertAsBrother(new LeafNode([
        'action' => CONFISCATE,
        'playerId' => $player->getId(),
        'optional' => true,
        'allowNotSubmissive' => $allowNotSubmissive,
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

  public function canBePerformed($player, $allowNotSubmissive = false)
  {
    if (count($this->getAvailableCarriageTypes()) === 0) {
      return false;
    }

    return count($this->getOptions($allowNotSubmissive)) > 0;
  }

  public function getAvailableCarriageTypes()
  {
    return array_values(array_unique(array_map(function ($carriage) {
      return $carriage->getType();
    }, Forces::getInLocation(CARRIAGE_SUPPLY)->toArray())));
  }

  public function getOptions($skipSubmissiveCheck = false)
  {
    $options = [];

    $spaces = Spaces::get(PARISHES);

    foreach ($spaces as $spaceId => $space) {
      if (!$skipSubmissiveCheck && !$space->isSubmissive()) {
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
