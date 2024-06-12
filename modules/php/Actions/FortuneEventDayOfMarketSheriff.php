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


class FortuneEventDayOfMarketSheriff extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_FORTUNE_EVENT_DAY_OF_MARKET_SHERIFF;
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

  public function stFortuneEventDayOfMarketSheriff()
  {
    $options = $this->getOptions();
    if ($options['maxNumber'] === 0) {
      $this->resolveAction(['automatic' => true, 'henchmenIds' => []]);
    }
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsFortuneEventDayOfMarketSheriff()
  {
    return $this->getOptions();
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

  public function actPassFortuneEventDayOfMarketSheriff()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actFortuneEventDayOfMarketSheriff($args)
  {
    self::checkAction('actFortuneEventDayOfMarketSheriff');
    $henchmenIds = $args['henchmenIds'];

    $options = $this->getOptions();

    if (count($henchmenIds) > $options['maxNumber']) {
      throw new \feException("ERROR 069");
    }
    $player = self::getPlayer();

    foreach($henchmenIds as $henchmanId) {
      $henchman = Utils::array_find($options['henchmen'], function ($force) use ($henchmanId) {
        return $force->getId() === $henchmanId;
      });
      if ($henchman === null) {
        throw new \feException("ERROR 070");
      }
      $henchman->returnToSupply($player);
    }

    $player->incShillings(count($henchmenIds));

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
    $henchmen = Utils::filter(Forces::getOfType(HENCHMEN), function ($force) {
      return in_array($force->getLocation(), SPACES);
    });
    $submissiveParishes = Utils::filter(Spaces::getMany(PARISHES)->toArray(), function ($parish) {
      return $parish->isSubmissive();
    });
    return [
      'henchmen' => $henchmen,
      'maxNumber' => min(count($submissiveParishes), count($henchmen)),
    ];
  }
}
