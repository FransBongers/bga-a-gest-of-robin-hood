<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Game;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class RoyalInspectionRedeploymentSheriff extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_ROYAL_INSPECTION_REDEPLOYMENT_SHERIFF;
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

  public function stRoyalInspectionRedeploymentSheriff()
  {
  }


  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsRoyalInspectionRedeploymentSheriff()
  {
    $info = $this->ctx->getInfo();

    $data = $this->getOptions();
    if (isset($info['source'])) {
      $data['source'] = 'Event14_TemporaryTruce';
    }
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

  public function actPassRoyalInspectionRedeploymentSheriff()
  {
    $player = self::getPlayer();
    $info = $this->ctx->getInfo();

    if (isset($info['source']) && $info['source'] === 'Event14_TemporaryTruce') {
      Notifications::message(clienttranslate('${player_name} does not move their Henchmen'), ['player' => $player]);
    }
    // Stats::incPassActionCount($player->getId(), 1);
    // Engine::resolve(PASS);
    $this->resolveAction(PASS);
  }

  public function actRoyalInspectionRedeploymentSheriff($args)
  {
    self::checkAction('actRoyalInspectionRedeploymentSheriff');
    $requiredMoves = $args['requiredMoves'];
    $optionalMoves = $args['optionalMoves'];

    $stateArgs = $this->getOptions();

    $forces = [];

    foreach ($stateArgs['henchmenMustMove'] as $henchmanId => $option) {
      $henchman = $option['henchman'];
      $destination = $requiredMoves[$henchman->getId()];
      if (!in_array($destination, $option['spaceIds'])) {
        throw new \feException("ERROR 048");
      }
      $henchman->setLocation($destination);
      $forces[] = $henchman;
    }

    foreach ($optionalMoves as $henchmanId => $destinationId) {
      if ($destinationId === null) {
        continue;
      }
      if (!isset($stateArgs['henchmenMayMove'][$henchmanId])) {
        throw new \feException("ERROR 049");
      }
      $option = $stateArgs['henchmenMayMove'][$henchmanId];
      $henchman = $option['henchman'];

      if (!in_array($destinationId, $option['spaceIds'])) {
        throw new \feException("ERROR 103");
      }
      $henchman->setLocation($destinationId);
      $forces[] = $henchman;
    }

    $info = $this->ctx->getInfo();
    $isTemporaryTruce = isset($info['source']) && $info['source'] === 'Event14_TemporaryTruce';

    if (!$isTemporaryTruce) {
      $usedCarriages = Forces::getInLocation(USED_CARRIAGES)->toArray();
      Forces::moveAllInLocation(USED_CARRIAGES, CARRIAGE_SUPPLY);
      foreach ($usedCarriages as $usedCarriage) {
        $usedCarriage->setHidden(1);
      }
    }

    $player = self::getPlayer();
    if ($isTemporaryTruce) {
      Notifications::temporaryTruceSheriff($player, $forces);
      Players::moveRoyalFavour($player, 1, ORDER);
    } else {
      Notifications::redeploymentSheriff($player, $forces, $usedCarriages);
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

  public function getOptions()
  {
    $info = $this->ctx->getInfo();
    $isTemporaryTruce = isset($info['source']) && $info['source'] === 'Event14_TemporaryTruce';

    $henchmenMustMove = [];
    $henchmenMayMove = [];

    $spaces = Spaces::getAll();
    $spacesArray = $spaces->toArray();
    $submissiveSpaceIds =
      array_map(
        function ($subSpace) {
          return $subSpace->getId();
        },
        Utils::filter($spacesArray, function ($space) {
          return $space->isSubmissive();
        })
      );
    $henchmen = Forces::getOfType(HENCHMEN);
    foreach ($henchmen as $henchman) {
      $spaceId = $henchman->getLocation();
      if ($spaceId === HENCHMEN_SUPPLY || $spaceId === REMOVED_FROM_GAME) {
        continue;
      }
      if (!$isTemporaryTruce && $spaceId === NOTTINGHAM) {
        continue;
      }
      $space = $spaces[$spaceId];
      if ($space->isRevolting() || $space->isForest() || ($isTemporaryTruce && $space->isPassive())) {
        $henchmenMustMove[$henchman->getId()] = [
          'henchman' => $henchman,
          'spaceIds' => $submissiveSpaceIds,
        ];
      } else {
        $henchmenMayMove[$henchman->getId()] = [
          'henchman' => $henchman,
          'spaceIds' => $isTemporaryTruce ? Utils::filter($submissiveSpaceIds, function ($destinationId) use ($spaceId) {
            return $destinationId !== $spaceId;
          }) : [NOTTINGHAM],
        ];
      }
    }
    return [
      'spaces' => $spaces,
      'henchmenMayMove' => $henchmenMayMove,
      'henchmenMustMove' => $henchmenMustMove,
    ];
  }
}
