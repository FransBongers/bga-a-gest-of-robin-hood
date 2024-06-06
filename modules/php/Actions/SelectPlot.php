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
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;


class SelectPlot extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_SELECT_PLOT;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsSelectPlot()
  {
    $action = $action = $this->getAction();

    $numberOfSpaces = $action === PLOTS_AND_DEEDS ? 3 : 1;

    $data = [
      'options' => $this->getRobinHoodOptions(self::getPlayer(), $numberOfSpaces),
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

  public function actPassSelectPlot()
  {
    $player = self::getPlayer();

    $shillings = 1;

    if ($player->isSheriff()) {
      $action = $this->getAction();
      if ($action === EVENT) {
        $shillings = 2;
      } else if ($action === PLOTS_AND_DEEDS) {
        $shillings = 3;
      }
    }

    $player->incShillings($shillings, false);

    Notifications::passAction($player, $shillings);
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actSelectPlot($args)
  {
    self::checkAction('actSelectPlot');
    Notifications::log('args', $args);
    $plotId = $args['plotId'];
    $spaceIds = $args['spaceIds'];

    $stateArgs = $this->argsSelectPlot();

    $options = $stateArgs['options'];

    if (!isset($options[$plotId])) {
      throw new \feException("ERROR 006");
    }

    $option = $options[$plotId];
    $targetSpaces = [];

    foreach ($spaceIds as $spaceId) {
      $space = Utils::array_find($option['spaces'], function ($space) use ($spaceId) {
        return $space->getId() === $spaceId;
      });
      if ($space === null) {
        throw new \feException("ERROR 007");
      }
      $targetSpaces[] = $space;
    }

    Notifications::selectedPlot(self::getPlayer(), $option['plotName'], $targetSpaces);

    $parent = $this->ctx->getParent();
    for ($i = 0; $i < count($targetSpaces); $i++) {
      $parent->pushChild(new LeafNode([
        'action' => $plotId,
        'playerId' => $this->ctx->getPlayerId(),
        'spaceIds' => $spaceIds,
        // 'optional' => true,
      ]));
    }

    if ($this->getAction() === PLOTS_AND_DEEDS) {
      $parent->pushChild(new LeafNode([
        'action' => SELECT_DEED,
        'playerId' => $this->ctx->getPlayerId(),
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

  public function getAction()
  {
    $node = Engine::getResolvedActions([CHOOSE_ACTION])[0];
    $action = $node->getActionResolutionArgs()['action'];
    return $action;
  }

  public function getRobinHoodOptions($player, $numberOfSpaces)
  {
    $availableShillings = $player->getShillings();

    $recruitOptions = AtomicActions::get(RECRUIT)->getOptions();
    $robOptions = AtomicActions::get(ROB)->getOptions();
    $sneakOptions = AtomicActions::get(RECRUIT)->getOptions();

    return [
      RECRUIT => [
        'spaces' => $recruitOptions,
        'numberOfSpaces' => min($availableShillings, $numberOfSpaces, count($recruitOptions)),
        'plotName' => clienttranslate('Recruit'),
      ],
      ROB => [
        'spaces' => $robOptions,
        'numberOfSpaces' => min($numberOfSpaces, count($robOptions)),
        'plotName' => clienttranslate('Rob'),
      ],
      SNEAK => [
        'spaces' => $sneakOptions,
        'numberOfSpaces' => min($availableShillings, $numberOfSpaces, count($sneakOptions)),
        'plotName' => clienttranslate('Sneak'),
      ],
    ];
  }
}
