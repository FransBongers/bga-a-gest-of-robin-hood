<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;

class Plot extends \AGestOfRobinHood\Models\AtomicAction
{
  public function insertPlotAction($player)
  {
    $selectedAction = $this->getSelectedAction();
    if ($selectedAction === null || $selectedAction === SINGLE_PLOT) {
      return;
      // Check for smaller than two as the current action is not resolved yet
    }
    $action = $this->ctx->getAction();

    if ($selectedAction === PLOTS_AND_DEEDS && count(Engine::getResolvedActions([$action])) < 2) {
      $this->ctx->insertAsBrother(new LeafNode([
        'action' => $action,
        'playerId' => $player->getId(),
        'optional' => true,
      ]));
    }
  }

  public function getSelectedAction()
  {
    $nodes = Engine::getResolvedActions([CHOOSE_ACTION]);
    // Can happen if select plot was result of event
    if (count($nodes) === 0) {
      return null;
    }
    $node = $nodes[0];
    $action = $node->getActionResolutionArgs()['action'];
    return $action;
  }

  // public function canBePerformed($player, $availableShillings)
  // {
  //   return false;
  // }
}
