<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;

class Plot extends \AGestOfRobinHood\Models\AtomicAction
{
  public function insertPlotAction($player)
  {
    $selectedAction = $this->getSelectedAction();
    if ($selectedAction === SINGLE_PLOT) {
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
    $node = Engine::getResolvedActions([CHOOSE_ACTION])[0];
    $action = $node->getActionResolutionArgs()['action'];
    return $action;
  }
}
