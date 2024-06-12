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


class FortuneEventDayOfMarketRobinHood extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_FORTUNE_EVENT_DAY_OF_MARKET_ROBIN_HOOD;
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

  public function stFortuneEventDayOfMarketRobinHood()
  {

    // $this->resolveAction(['automatic' => true]);
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsFortuneEventDayOfMarketRobinHood()
  {

    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => $this->getOptions(),
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

  public function actPassFortuneEventDayOfMarketRobinHood()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actFortuneEventDayOfMarketRobinHood($args)
  {
    self::checkAction('actFortuneEventDayOfMarketRobinHood');
    $merryManId = $args['merryManId'];

    $options = $this->getOptions();

    $merryMan = Utils::array_find($options['merryMen'], function ($force) use ($merryManId) {
      return $force->getId() === $merryManId;
    });

    if ($merryMan === null) {
      throw new \feException("ERROR 071");
    }

    $player = self::getPlayer();
    $merryMan->returnToSupply($player);

    if ($options['amount'] > 0) {
      $player->incShillings($options['amount']);
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

  private function getOptions()
  {
    $nodes = Engine::getResolvedActions([FORTUNE_EVENT_DAY_OF_MARKET_SHERIFF]);
    $amount = 0;
    if (count($nodes) > 0) {
      $amount = floor(count($nodes[0]->getActionResolutionArgs()['henchmenIds']) / 2);
    }

    $merryMen = Forces::getOfType(MERRY_MEN);
    $merryMen[] = Forces::get(ROBIN_HOOD);

    $merryMen = Utils::filter($merryMen, function ($merryMan) {
      return in_array($merryMan->getLocation(), SPACES);
    });

    return [
      'merryMen' => $merryMen,
      'amount' => $amount,
    ];
  }
}
