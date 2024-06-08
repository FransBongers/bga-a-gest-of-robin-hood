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
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class Rob extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_ROB;
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

  public function stRob()
  {
    $player = self::getPlayer();

    if (!$this->canBePerformed($player, $player->getShillings())) {
      $this->resolveAction(['automatic' => true]);
    }
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsRob()
  {
    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => [
          'options' => $this->getOptions(),
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

  public function actPassRob()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actRob($args)
  {
    self::checkAction('actRob');

    $spaceId = $args['spaceId'];
    $target = $args['target'];
    $merryMenIds = $args['merryMenIds'];

    $options = $this->getOptions();

    if (!isset($options[$spaceId])) {
      throw new \feException("ERROR 026");
    }

    $option = $options[$spaceId];

    if ($target === 'traveller' && !$option['traveller']) {
      throw new \feException("ERROR 027");
    }
    if ($target === 'treasury' && !$option['treasury']) {
      throw new \feException("ERROR 028");
    }
    if ((in_array($target, CARRIAGE_TYPES) || $target === HIDDEN_CARRIAGE) && $option['carriages'][$target] === 0) {
      throw new \feException("ERROR 029");
    }

    $merryMen = Utils::filter($option['merryMen'], function ($merryMan) use ($merryMenIds) {
      return in_array($merryMan->getId(), $merryMenIds);
    });

    if (count($merryMenIds) === 0 || count($merryMen) !== count($merryMenIds)) {
      throw new \feException("ERROR 030");
    }

    $player = self::getPlayer();

    foreach ($merryMen as $merryMan) {
      if ($merryMan->isHidden()) {
        $merryMan->reveal($player);
      }
    }

    // Insert plot first because resolution may insert more actions
    $this->insertPlotAction($player);

    $space = $option['space'];

    switch ($target) {
      case 'traveller':
        $this->resolveTravellerTarget($player, $space);
        break;
      case 'treasury':
        break;
      case HIDDEN_CARRIAGE:
      case TALLAGE_CARRIAGE:
      case TRIBUTE_CARRIAGE:
      case TRAP_CARRIAGE:
        break;
    };

    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private function resolveTravellerTarget($player, $space)
  {
    $card = Cards::drawAndRevealTravellerCard($player);

    // TODO: check what needs to be done? Probably shuffle?
    if ($card === null) {
      return;
    }

    $this->ctx->insertAsBrother(new LeafNode([
      'action' => SELECT_TRAVELLER_CARD_OPTION,
      'playerId' => $player->getId(),
      'spaceId' => $space->getId(),
    ]));
  }

  public function canBePerformed($player, $availableShillings)
  {
    return count($this->getOptions()) > 0;
  }

  public function getName()
  {
    return clienttranslate('Rob');
  }

  public function getOptions()
  {
    $options = [];
    $spaces = Spaces::getAll();
    $forces = Forces::getAll()->toArray();

    foreach ($spaces as $spaceId => $space) {
      $merryMenInSpaceThatCanRob = Utils::filter($forces, function ($force) use ($spaceId) {
        return $force->getLocation() === $spaceId && ($force->isRobinHood() || ($force->isMerryMan() && $force->isHidden()));
      });
      if (count($merryMenInSpaceThatCanRob) === 0) {
        continue;
      }

      $carriagesInSpace = [
        HIDDEN_CARRIAGE => 0,
        TALLAGE_CARRIAGE => 0,
        TRAP_CARRIAGE => 0,
        TRIBUTE_CARRIAGE => 0,
      ];

      foreach ($forces as $force) {
        if (!$force->isCarriage() || $force->getLocation() !== $spaceId) {
          continue;
        }
        if ($force->isHidden()) {
          $carriagesInSpace[HIDDEN_CARRIAGE]++;
        } else {
          $carriagesInSpace[$force->getType()]++;
        }
      }

      $options[$spaceId] = [
        'space' => $space,
        'traveller' => true, // Do we need to check if there are cars in the deck?
        'carriages' => $carriagesInSpace,
        'merryMen' => $merryMenInSpaceThatCanRob,
        'treasury' => $spaceId === NOTTINGHAM,
      ];
    }

    return $options;
  }
}
