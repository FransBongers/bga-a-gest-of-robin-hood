<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;


class SelectDeed extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_SELECT_DEED;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsSelectDeed()
  {
    $player = self::getPlayer();
    $playerId = $player->getId();

    $data = [
      '_private' => [
        $playerId => [
          'options' => $this->getOptions($player),
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

  public function actPassSelectDeed()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    // Engine::resolve(PASS);
    $this->resolveAction(PASS);
  }

  public function actSelectDeed($args)
  {
    self::checkAction('actSelectDeed');
    $deedId = $args['deedId'];

    $player = self::getPlayer();

    $options = $this->getOptions($player);

    if (!isset($options[$deedId])) {
      throw new \feException("ERROR 012");
    }

    Notifications::performDeed($player, AtomicActions::get($deedId)->getName());
    $info = $this->ctx->getInfo();
    $source = isset($info['source']) ? $info['source'] : null;

    $playerId = $player->getId();
    $node = [
      'action' => $deedId,
      'playerId' => $playerId,
    ];

    if ($source !== null) {
      $node['source'] = $source;
    }

    $this->ctx->getParent()->pushChild(new LeafNode($node));

    switch ($deedId) {
      case TURNCOAT:
        Stats::incTurncoat($playerId, 1);
        break;
      case DONATE:
        Stats::incDonate($playerId, 1);
        break;
      case SWASHBUCKLE:
        Stats::incSwashbuckle($playerId, 1);
        break;
      case INSPIRE:
        Stats::incInspire($playerId, 1);
        break;
      case RIDE:
        Stats::incRide($playerId, 1);
        break;
      case CONFISCATE:
        Stats::incConfiscate($playerId, 1);
        break;
      case DISPERSE:
        Stats::incDisperse($playerId, 1);
        break;
      default:
        break;
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

  public function getOptions($player)
  {
    $side = $player->getSide();
    $deeds = $side === ROBIN_HOOD ? [TURNCOAT, DONATE, SWASHBUCKLE, INSPIRE] : [RIDE, CONFISCATE, DISPERSE];

    $info = $this->ctx->getInfo();
    $allowedDeeds = isset($info['allowedDeeds']) ? $info['allowedDeeds'] : null;

    if ($allowedDeeds !== null) {
      $deeds = Utils::filter($deeds, function ($deed) use ($allowedDeeds) {
        return in_array($deed, $allowedDeeds);
      });
    }

    $mayUseAnyMerryMen = isset($info['source']) && $info['source'] === 'Event24_MaidMarian';

    $options = [];

    foreach ($deeds as $deed) {
      $action = AtomicActions::get($deed);
      $canBePerformed = $action->canBePerformed($player, $mayUseAnyMerryMen);
      if (!$canBePerformed) {
        continue;
      }
      $options[$deed] = $action->getName();
    }

    return $options;
  }
}
