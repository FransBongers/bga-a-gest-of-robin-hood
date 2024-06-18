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


class Inspire extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_INSPIRE;
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

  public function stInspire()
  {
    $info = $this->ctx->getInfo();
    $mayUseAnyMerryMen = isset($info['source']) && $info['source'] === 'Event24_MaidMarian';
    $options = $this->getOptions($mayUseAnyMerryMen);

    if (count($options) > 1) {
      return;
    }

    $this->resolveInspire($options[0]['merryMan'], $options[0]['space']);

    $this->resolveAction(['automatic' => true]);
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsInspire()
  {
    $info = $this->ctx->getInfo();
    $mayUseAnyMerryMen = isset($info['source']) && $info['source'] === 'Event24_MaidMarian';
    $options = $this->getOptions($mayUseAnyMerryMen);

    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => $options,
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

  public function actPassInspire()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actInspire($args)
  {
    self::checkAction('actInspire');
    $merryMenId = $args['merryMenId'];

    $info = $this->ctx->getInfo();
    $mayUseAnyMerryMen = isset($info['source']) && $info['source'] === 'Event24_MaidMarian';
    $options = $this->getOptions($mayUseAnyMerryMen);

    $option = Utils::array_find($options, function ($availableOption) use ($merryMenId) {
      return $availableOption['merryMan']->getId() === $merryMenId;
    });
    if ($option === null) {
      throw new \feException("ERROR 093");
    }

    $this->resolveInspire($option['merryMan'], $option['space']);

    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private function resolveInspire($force, $space)
  {
    $player = self::getPlayer();

    $force->reveal($player);

    if ($space->getStatus() === REVOLTING) {
      Players::moveRoyalFavour($player, 1, JUSTICE);
    } else if ($space->getStatus() === SUBMISSIVE) {
      $space->revolt($player);
    }
  }

  public function getName()
  {
    return clienttranslate('Inspire');
  }

  public function canBePerformed($player, $mayUseAnyMerryMen = false)
  {
    return count($this->getOptions($mayUseAnyMerryMen)) > 0;
  }


  public function getOptions($mayUseAnyMerryMen = false)
  {
    $options = [];

    $merryMenThatCanPerform = [];
    if ($mayUseAnyMerryMen) {
      $merryMenThatCanPerform = Utils::filter(Forces::getOfType(MERRY_MEN), function ($force) {
        return $force->isHidden() && in_array($force->getLocation(), PARISHES);
      });
    }
    $robinHood = Forces::get(ROBIN_HOOD);
    if ($robinHood->isHidden() && in_array($robinHood->getLocation(), PARISHES)) {
      $merryMenThatCanPerform[] = $robinHood;
    }

    $spaces = Spaces::get(PARISHES);

    foreach ($merryMenThatCanPerform as $merryMan) {
      $spaceId = $merryMan->getLocation();
      $space = $spaces[$spaceId];
      if (!($space->isSubmissive() || $space->isRevolting())) {
        continue;
      }
      $options[] = [
        'merryMan' => $merryMan,
        'space' => $space,
        'isSubmissive' => $space->isSubmissive(),
      ];
    }

    return $options;
  }
}
