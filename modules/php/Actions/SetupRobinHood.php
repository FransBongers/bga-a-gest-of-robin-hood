<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;

/**
 * TODO: check if this can be removed?
 */
class SetupRobinHood extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_SETUP_ROBIN_HOOD;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsSetupRobinHood()
  {

    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => $this->getOptions(),
      ]
    ];

    // args['_private'][specificPid]=

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

  public function actPassSetupRobinHood()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  // public function actSetupRobinHood($cardId, $strength)
  public function actSetupRobinHood($args)
  {
    self::checkAction('actSetupRobinHood');

    $robinHoodArgs = $args['robinHood'];
    $merryMenArgs = $args['merryMen'];

    $allowesSpaces = [SHIRE_WOOD, SOUTHWELL_FOREST, REMSTON];
    if (!in_array($robinHoodArgs, $allowesSpaces)) {
      throw new \feException("ERROR 001");
    }

    $options = $this->getOptions();
    $robinHood = $options['robinHood'];
    $robinHood->setLocation($robinHoodArgs);

    $merryMen = [];

    foreach ($merryMenArgs as $data) {
      if (!in_array($data['location'], $allowesSpaces)) {
        throw new \feException("ERROR 002");
      }

      $merryManId = $data['id'];
      $merryMan = Utils::array_find($options['merryMen'], function ($force) use ($merryManId) {
        return $force->getId() === $merryManId;
      });
      if ($merryMan === null) {
        throw new \feException("ERROR 099");
      }
      $merryMan->setLocation($data['location']);
      $merryMen[] = $merryMan;
    }

    Notifications::setupRobinHood(self::getPlayer(), $robinHood, $merryMen);

    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private function getOptions()
  {
    return [
      'robinHood' => Forces::get(ROBIN_HOOD),
      'merryMen' => Forces::getTopOf(MERRY_MEN_SUPPLY, 3)->toArray(),
    ];
  }
}
