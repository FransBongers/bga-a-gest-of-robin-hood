<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\GestDice;
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
    $info = $this->ctx->getInfo();
    $inSpacesIds = isset($info['spaceIds']) ? $info['spaceIds'] : [];
    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => [
          'options' => $this->getOptions($inSpacesIds),
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
    // Engine::resolve(PASS);
    $this->resolveAction(PASS);
  }

  public function actRob($args)
  {
    self::checkAction('actRob');

    $spaceId = $args['spaceId'];
    $target = $args['target'];
    $merryMenIds = $args['merryMenIds'];
    $info = $this->ctx->getInfo();
    $inSpacesIds = isset($info['spaceIds']) ? $info['spaceIds'] : [];

    $options = $this->getOptions($inSpacesIds);

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
    $source = isset($info['source']) ? $info['source'] : null;

    switch ($target) {
      case 'traveller':
        $this->resolveTravellerTarget($player, $space, $merryMenIds, $source);
        break;
      case 'treasury':
        $this->resolveTreasuryTarget($player, $space, $merryMenIds, $source);
        break;
      case HIDDEN_CARRIAGE:
      case TALLAGE_CARRIAGE:
      case TRIBUTE_CARRIAGE:
      case TRAP_CARRIAGE:
        $this->resolveCarriageTarget($player, $space, $merryMenIds, $target, $source);
        break;
    };

    $this->resolveAction($args, true);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private function resolveCarriageTarget($player, $space, $merryMenIds, $target, $source = null)
  {
    $forces = $space->getForces();
    shuffle($forces);
    $carriage = Utils::array_find($forces, function ($force) use ($target) {
      if (!$force->isCarriage()) {
        return false;
      }
      // TODO: randomize pickes carriage with bga_rand ?
      if ($target === HIDDEN_CARRIAGE && $force->isHidden()) {
        return true;
      } else if (in_array($target, CARRIAGE_TYPES) && !$force->isHidden()) {
        return true;
      }
      return false;
    });
    if ($carriage === null) {
      throw new \feException("ERROR 083");
    }
    $defenseValue = $carriage->getType() === TRAP_CARRIAGE ? 2 : 0;
    $henchmenInSpace = count(Utils::filter($forces, function ($force) {
      return $force->isHenchman();
    }));
    $defenseValue += $henchmenInSpace;
    Notifications::robTargetCarriage($player, $space);
    if ($carriage->isHidden()) {
      $carriage->reveal($player);
    }
    $dieColor = $space->isRevolting() || $space->isForest() ? GREEN : WHITE;
    $dieResult =  $dieColor === GREEN ? GestDice::rollGreenDie() : GestDice::rollWhiteDie();
    $modifier = $source === 'Event22_FastCarriages' ? 1 : 0;

    $success = $dieResult + count($merryMenIds) + $modifier > $defenseValue;
    Notifications::robResult($player, $dieColor, $dieResult, $success);

    if ($success) {
      switch ($carriage->getType()) {
        case TALLAGE_CARRIAGE:
          $player->incShillings(5);
          break;
        case TRIBUTE_CARRIAGE:
          $player->incShillings(2);
          Players::moveRoyalFavour($player, 1, JUSTICE);
          break;
        case TRAP_CARRIAGE:
          $player->incShillings(2);
          break;
      }
      $carriage->setLocation(Locations::usedCarriages());
      Notifications::moveCarriageToUsedCarriages($player, $carriage, $space->getId());
    } else if (!$success && $carriage->getType() === TRAP_CARRIAGE) {
      $merryMen = Forces::getMany($merryMenIds)->toArray();
      $capturedPieces = [];
      $spaceId = $space->getId();
      foreach ($merryMen as $merryMan) {
        $merryMan->setLocation(PRISON);
        $capturedPieces[] = [
          'force' => $merryMan,
          'type' => $merryMan->getType(),
          'hidden' => false,
          'spaceId' => $spaceId,
        ];
      }

      Notifications::captureMerryMen($player, $space, $capturedPieces);
      if (in_array(ROBIN_HOOD, $merryMenIds)) {
        Players::moveRoyalFavour($player, 1, ORDER);
      }
    }
  }

  private function resolveTravellerTarget($player, $space, $merryMenIds, $source)
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
      'merryMenIds' => $merryMenIds,
      'source' => $source,
    ]));
  }

  private function resolveTreasuryTarget($player, $space, $merryMenIds, $source = null)
  {
    $henchmenInSpace = count(Utils::filter($space->getForces(), function ($force) {
      return $force->isHenchman();
    }));
    $dieResult = GestDice::rollWhiteDie();

    $modifier = $source === 'Event22_FastCarriages' ? 1 : 0;
    $success = count($merryMenIds) + $dieResult + $modifier > $henchmenInSpace;
    Notifications::robTargetSheriffsTreasury($player);
    Notifications::robResult($player, WHITE, $dieResult, $success);
    if ($success) {
      $this->takeShillingsFromTheSheriff($player);
    }
  }

  public function takeShillingsFromTheSheriff($player) {
    $sheriffPlayer = Players::getSheriffPlayer();
    $amount = min(2, $sheriffPlayer->getShillings());
    $sheriffPlayer->incShillings(-$amount, false);
    $player->incShillings($amount, false);
    Notifications::robTakeShillingsFromTheSheriff($player, $sheriffPlayer, $amount);
    Players::moveRoyalFavour($player, 1, JUSTICE);
  }

  public function canBePerformed($player, $availableShillings, $cost = null)
  {
    return count($this->getOptions()) > 0;
  }

  public function getName()
  {
    return clienttranslate('Rob');
  }

  public function getOptions($inSpaceIds = [])
  {
    $options = [];
    $spaces = Spaces::getAll();
    $forces = Forces::getAll()->toArray();

    $alreadyRobbedSpaceIds = [];
    $nodes = Engine::getResolvedActions([ROB]);
    foreach ($nodes as $node) {
      $resArgs = $node->getActionResolutionArgs();
      $alreadyRobbedSpaceIds[] = $resArgs['spaceId'];
    }

    foreach ($spaces as $spaceId => $space) {
      if (in_array($spaceId, $alreadyRobbedSpaceIds)) {
        continue;
      }
      if (count($inSpaceIds) > 0 && !in_array($spaceId, $inSpaceIds)) {
        continue;
      }

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
