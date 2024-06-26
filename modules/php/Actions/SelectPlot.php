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
use AGestOfRobinHood\Spaces\Nottingham;

class SelectPlot extends \AGestOfRobinHood\Actions\Plot
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
    // $action = $this->getSelectedAction();

    // $numberOfSpaces = $action === PLOTS_AND_DEEDS ? 3 : 1;

    $player = self::getPlayer();




    $data = [
      'options' => $this->getOptions($player),
      'extraOptionId' => $this->getExtraOptionId(),
      // $player->isRobinHood() ?
      //   $this->getRobinHoodOptions($player, $numberOfSpaces) :
      //   $this->getSheriffOptions($player, $numberOfSpaces),
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
    $parent = $this->ctx->getParent();
    if ($this->getSelectedAction() === PLOTS_AND_DEEDS) {
      $parent->pushChild(new LeafNode([
        'action' => SELECT_DEED,
        'playerId' => $this->ctx->getPlayerId(),
      ]));
    }

    // Notifications::passAction($player, $shillings);
    // Stats::incPassActionCount($player->getId(), 1);
    // Engine::resolve(PASS);
    $this->resolveAction(PASS);
  }

  public function actSelectPlot($args)
  {
    self::checkAction('actSelectPlot');
    $plotId = isset($args['plotId']) ? $args['plotId'] : null;
    $extraOptionId = isset($args['extraOptionId']) ? $args['extraOptionId'] : null;

    // Notifications::log('actSelectPlot', $args);
    // $spaceIds = $args['spaceIds'];

    $stateArgs = $this->argsSelectPlot();

    $options = $stateArgs['options'];

    if ($plotId === null && $extraOptionId === null) {
      throw new \feException("ERROR 045");
    }

    if ($plotId !== null && !isset($options[$plotId])) {
      throw new \feException("ERROR 006");
    }

    if ($extraOptionId !== null && $extraOptionId !== $stateArgs['extraOptionId']) {
      throw new \feException("ERROR 046");
    }

    if ($plotId !== null) {
      Notifications::selectedPlot(self::getPlayer(), $options[$plotId]);
      $parent = $this->ctx->getParent();

      $info = $this->ctx->getInfo();
      $cost = isset($info['cost']) ? $info['cost'] : null;

      $node = [
        'action' => $plotId,
        'playerId' => $this->ctx->getPlayerId(),
        // 'optional' => true,
      ];
      if ($cost !== null) {
        $node['cost'] = $cost;
      }

      $this->ctx->insertAsBrother(new LeafNode($node));


      if ($this->getSelectedAction() === PLOTS_AND_DEEDS) {
        $parent->pushChild(new LeafNode([
          'action' => SELECT_DEED,
          'playerId' => $this->ctx->getPlayerId(),
          'optional' => true,
        ]));
      }
    } else if ($extraOptionId !== null) {
      $this->resolveExtraOption($extraOptionId);
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

  private function resolveExtraOption($extraOptionId)
  {
    $player = self::getPlayer();

    switch ($extraOptionId) {
      case GAIN_TWO_SHILLINGS:
        Notifications::extraOption($player, $extraOptionId);
        $player->incShillings(2);
        break;
    }
  }

  private function getExtraOptionId()
  {
    $info = $this->ctx->getInfo();

    if (isset($info['source'])) {
      $source = $info['source'];
      switch ($source) {
        case 'Event16_HeavyRain':
          return GAIN_TWO_SHILLINGS;
          defaukt:
          return null;
      }
    } else {
      return null;
    }
  }

  public function getOptions($player)
  {
    $side = $player->getSide();
    $plots = $side === ROBIN_HOOD ? [RECRUIT, ROB, SNEAK] : [HIRE, PATROL, CAPTURE];
    $info = $this->ctx->getInfo();
    $cost = isset($info['cost']) ? $info['cost'] : null;

    $options = [];
    $availableShillings = $player->getShillings();

    foreach ($plots as $plot) {
      $action = AtomicActions::get($plot);
      $canBePerformed = $action->canBePerformed($player, $availableShillings, $cost);
      if (!$canBePerformed) {
        continue;
      }
      $options[$plot] = $action->getName();
    }

    return $options;
  }

  // public function getRobinHoodOptions($player, $numberOfSpaces)
  // {
  //   $availableShillings = $player->getShillings();

  //   $recruitOptions = AtomicActions::get(RECRUIT)->getOptions();
  //   $robOptions = AtomicActions::get(ROB)->getOptions();
  //   $sneakOptions = AtomicActions::get(RECRUIT)->getOptions();

  //   return [
  //     RECRUIT => [
  //       'spaces' => $recruitOptions,
  //       'numberOfSpaces' => min($availableShillings, $numberOfSpaces, count($recruitOptions)),
  //       'plotName' => clienttranslate('Recruit'),
  //     ],
  //     ROB => [
  //       'spaces' => $robOptions,
  //       'numberOfSpaces' => min($numberOfSpaces, count($robOptions)),
  //       'plotName' => clienttranslate('Rob'),
  //     ],
  //     SNEAK => [
  //       'spaces' => $sneakOptions,
  //       'numberOfSpaces' => min($availableShillings, $numberOfSpaces, count($sneakOptions)),
  //       'plotName' => clienttranslate('Sneak'),
  //     ],
  //   ];
  // }

  // public function getSheriffOptions($player, $numberOfSpaces)
  // {
  //   $availableShillings = $player->getShillings();

  //   $hireOptions = AtomicActions::get(HIRE)->getOptions();
  //   $patrolOptions = AtomicActions::get(PATROL)->getOptions();
  //   $captureOptions = AtomicActions::get(CAPTURE)->getOptions();

  //   return [
  //     HIRE => [
  //       'spaces' => $hireOptions,
  //       'numberOfSpaces' => min(floor($availableShillings / 2), $numberOfSpaces, count($hireOptions)),
  //       'plotName' => clienttranslate('Hire'),
  //     ],
  //     PATROL => [
  //       'spaces' => $patrolOptions,
  //       'numberOfSpaces' => min(floor($availableShillings / 2), $numberOfSpaces, count($patrolOptions)),
  //       'plotName' => clienttranslate('Patrol'),
  //     ],
  //     CAPTURE => [
  //       'spaces' => $captureOptions,
  //       'numberOfSpaces' => min($numberOfSpaces, count($captureOptions)),
  //       'plotName' => clienttranslate('Capture'),
  //     ],
  //   ];
  // }
}
