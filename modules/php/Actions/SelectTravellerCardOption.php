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
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;


class SelectTravellerCardOption extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_SELECT_TRAVELLER_CARD_OPTION;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsSelectTravellerCardOption()
  {
    // $action = $this->getSelectedAction();

    // $numberOfSpaces = $action === PLOTS_AND_DEEDS ? 3 : 1;

    $player = self::getPlayer();

    $data = [
      'card' => Cards::getTopOf(TRAVELLERS_DISCARD)
 
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

  public function actPassSelectTravellerCardOption()
  {
    $player = self::getPlayer();

    // Notifications::passAction($player, $shillings);
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actSelectTravellerCardOption($args)
  {
    self::checkAction('actSelectTravellerCardOption');
    $plotId = $args['plotId'];
    // $spaceIds = $args['spaceIds'];

    $stateArgs = $this->argsSelectTravellerCardOption();

    $options = $stateArgs['options'];

    if (!isset($options[$plotId])) {
      throw new \feException("ERROR 006");
    }

    // $option = $options[$plotId];
    // $targetSpaces = [];

    // foreach ($spaceIds as $spaceId) {
    //   $space = Utils::array_find($option['spaces'], function ($space) use ($spaceId) {
    //     return $space->getId() === $spaceId;
    //   });
    //   if ($space === null) {
    //     throw new \feException("ERROR 007");
    //   }
    //   $targetSpaces[] = $space;
    // }

    Notifications::selectedPlot(self::getPlayer(), $options[$plotId]);

    $parent = $this->ctx->getParent();
    // Plots that can be resolved automatically

    $parent->pushChild(new LeafNode([
      'action' => $plotId,
      'playerId' => $this->ctx->getPlayerId(),
      // 'optional' => true,
    ]));

    // if (in_array($plotId, [HIRE])) {
    //   $parent->pushChild(new LeafNode([
    //     'action' => $plotId,
    //     'playerId' => $this->ctx->getPlayerId(),
    //     'spaceIds' => $spaceIds,
    //   ]));
    // } else {

    //   for ($i = 0; $i < count($targetSpaces); $i++) {
    //     $parent->pushChild(new LeafNode([
    //       'action' => $plotId,
    //       'playerId' => $this->ctx->getPlayerId(),
    //       'spaceIds' => $spaceIds,
    //       // 'optional' => true,
    //     ]));
    //   }
    // }

    if ($this->getSelectedAction() === PLOTS_AND_DEEDS) {
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

  public function getSelectedAction()
  {
    $node = Engine::getResolvedActions([CHOOSE_ACTION])[0];
    $action = $node->getActionResolutionArgs()['action'];
    return $action;
  }

  public function getOptions($player)
  {
    $side = $player->getSide();
    $plots = $side === ROBIN_HOOD ? [RECRUIT, ROB, SNEAK] : [HIRE, PATROL, CAPTURE];

    $options = [];
    $availableShillings = $player->getShillings();

    foreach ($plots as $plot) {
      $action = AtomicActions::get($plot);
      $canBePerformed = $action->canBePerformed($player, $availableShillings);
      if (!$canBePerformed) {
        continue;
      }
      $options[$plot] = $action->getName();
    }

    return $options;
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

  public function getSheriffOptions($player, $numberOfSpaces)
  {
    $availableShillings = $player->getShillings();

    $hireOptions = AtomicActions::get(HIRE)->getOptions();
    $patrolOptions = AtomicActions::get(PATROL)->getOptions();
    $captureOptions = AtomicActions::get(CAPTURE)->getOptions();

    return [
      HIRE => [
        'spaces' => $hireOptions,
        'numberOfSpaces' => min(floor($availableShillings / 2), $numberOfSpaces, count($hireOptions)),
        'plotName' => clienttranslate('Hire'),
      ],
      PATROL => [
        'spaces' => $patrolOptions,
        'numberOfSpaces' => min(floor($availableShillings / 2), $numberOfSpaces, count($patrolOptions)),
        'plotName' => clienttranslate('Patrol'),
      ],
      CAPTURE => [
        'spaces' => $captureOptions,
        'numberOfSpaces' => min($numberOfSpaces, count($captureOptions)),
        'plotName' => clienttranslate('Capture'),
      ],
    ];
  }
}
