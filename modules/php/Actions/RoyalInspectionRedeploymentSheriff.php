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
    // $riMarker = Markers::get(ROYAL_INSPECTION_MARKER);
    // $riMarker->setLocation(Locations::royalInspectionTrack(REDEPLOYMENT));
    // Notifications::moveRoyalInspectionMarker($riMarker);

    // $this->resolveAction(['automatic' => true]);
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
    // $data = [];

    return $this->getOptions();
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
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
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

    foreach ($optionalMoves as $henchmanId) {
      if (!isset($stateArgs['henchmenMayMove'][$henchmanId])) {
        throw new \feException("ERROR 049");
      }
      $henchman = $stateArgs['henchmenMayMove'][$henchmanId]['henchman'];
      $henchman->setLocation(NOTTINGHAM);
      $forces[] = $henchman;
    }

    Notifications::redeploymentSheriff(self::getPlayer(), $forces);

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
      if ($spaceId === HENCHMEN_SUPPLY || $spaceId === NOTTINGHAM) {
        continue;
      }
      $space = $spaces[$spaceId];
      if ($space->isRevolting() || $space->isForest()) {
        $henchmenMustMove[$henchman->getId()] = [
          'henchman' => $henchman,
          'spaceIds' => $submissiveSpaceIds,
        ];
      } else {
        $henchmenMayMove[$henchman->getId()] = [
          'henchman' => $henchman,
          'spaceIds' => [NOTTINGHAM],
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
