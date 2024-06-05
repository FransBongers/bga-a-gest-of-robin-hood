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
    Engine::resolve(PASS);
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

    $this->ctx->getParent()->pushChild(new LeafNode([
      'action' => $deedId,
      'playerId' => $player->getId(),
    ]));

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
    Notifications::log('side', $side);
    $deeds = $side === ROBIN_HOOD ? [DONATE, INSPIRE, SWASHBUCKLE, TURNCOAT] : [RIDE, CONFISCATE, DISPERSE];

    $options = [];

    foreach ($deeds as $deed) {
      $action = AtomicActions::get($deed);
      $canBePerformed = $action->canBePerformed($player);
      Notifications::log('canBePerformed', $canBePerformed);
      if (!$canBePerformed) {
        continue;
      }
      $options[$deed] = $action->getName();
    }

    // $turnCoatSpaces = AtomicActions::get(TURNCOAT)->getPossibleSpaces();
    // $donateSpaces = AtomicActions::get(DONATE)->getPossibleSpaces();
    // $swashbuckleSpaces = AtomicActions::get(SWASHBUCKLE)->getPossibleSpaces();
    // $inspireSpaces = AtomicActions::get(INSPIRE)->getPossibleSpaces();

    // return [
    //   DONATE => [
    //     'spaces' => $donateSpaces,
    //     'numberOfSpaces' => min(floor($availableShillings / 2), 2, count($donateSpaces)),
    //     'deedName' => clienttranslate('Recruit'),
    //   ],
    //   INSPIRE => [
    //     'spaces' => $inspireSpaces,
    //     'numberOfSpaces' => min(1, count($inspireSpaces)),
    //     'deedName' => clienttranslate('Rob'),
    //   ],
    //   SWASHBUCKLE => [
    //     'spaces' => $swashbuckleSpaces,
    //     'numberOfSpaces' => min(1, count($swashbuckleSpaces)),
    //     'deedName' => clienttranslate('Sneak'),
    //   ],
    //   TURNCOAT => [
    //     'spaces' => $turnCoatSpaces,
    //     'numberOfSpaces' => min($availableShillings, 1, count($turnCoatSpaces)),
    //     'deedName' => clienttranslate('Sneak'),
    //   ],
    // ];

    return $options;
  }
}
