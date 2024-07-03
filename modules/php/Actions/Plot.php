<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Players;

class Plot extends \AGestOfRobinHood\Models\AtomicAction
{
  public function insertPlotAction($player)
  {
    // $player = Players::get($player->getId());

    $selectedAction = $this->getSelectedAction();
    if ($selectedAction === SINGLE_PLOT || ($selectedAction === null && !Cards::getTopOf(EVENTS_DISCARD)->isFortuneEvent())) {
      return;
    }
    $action = $this->ctx->getAction();
    $info = $this->ctx->getInfo();
    $sourceIsSet = isset($info['source']);

    $leafNode = [
      'action' => $action,
      'playerId' => $player->getId(),
      'optional' => true,
    ];
    if ($sourceIsSet) {
      $leafNode['source'] = $info['source'];
    }
    $numberOfResolvedActions = count(Engine::getResolvedActions([$action]));
    $availableShillings = $player->getShillings();

    $extraActionPlotsAndDeeds = $selectedAction === PLOTS_AND_DEEDS && $numberOfResolvedActions < 2 && $this->canBePerformed($player, $availableShillings);
    $extraActionFastCarriages = $selectedAction === EVENT && $action === ROB && $sourceIsSet && $info['source'] === 'Event22_FastCarriages' && $numberOfResolvedActions < 2;
    $extraActionWardenOfTheForest = $sourceIsSet && $info['source'] === 'Event08_WardenOfTheForest' && $action === HIRE && $numberOfResolvedActions < 1 && $this->canBePerformed($player, $availableShillings >= 2, null, $info['source']);
    // Notifications::log('extraActionWardenOfTheForest', $extraActionWardenOfTheForest);
    if ($extraActionPlotsAndDeeds || $extraActionFastCarriages || $extraActionWardenOfTheForest) {
      $this->ctx->insertAsBrother(new LeafNode($leafNode));
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

  public function canBePerformed($player, $availableShillings)
  {
    return false;
  }
}
