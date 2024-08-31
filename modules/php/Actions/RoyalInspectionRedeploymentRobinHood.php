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
use PDO;

class RoyalInspectionRedeploymentRobinHood extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_ROYAL_INSPECTION_REDEPLOYMENT_ROBIN_HOOD;
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

  public function stRoyalInspectionRedeploymentRobinHood()
  {


    // $this->resolveAction(['automatic' => true]);
  }


  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsRoyalInspectionRedeploymentRobinHood()
  {
    $info = $this->ctx->getInfo();

    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => $this->getOptions(),
      ]
    ];
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

  public function actPassRoyalInspectionRedeploymentRobinHood()
  {
    // $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    $this->resolveAction(PASS);
  }

  public function actRoyalInspectionRedeploymentRobinHood($args)
  {
    self::checkAction('actRoyalInspectionRedeploymentRobinHood');

    $requiredMoves = $args['requiredMoves'];
    $optionalMoves = $args['optionalMoves'];

    $stateArgs = $this->getOptions();

    $forces = [];
    $moves = [];

    $moveInput = [];

    foreach ($stateArgs['merryMenMustMove'] as $merryManId => $option) {
      $merryMan = $option['merryMan'];
      $destination = $requiredMoves[$merryMan->getId()];
      if (!in_array($destination, $option['spaceIds'])) {
        throw new \feException("ERROR 050");
      }
      $moveInput[] = [
        'force' => $merryMan,
        'toSpaceId' => $destination,
        'toHidden' => true,
      ];
    }


    foreach ($optionalMoves as $merryManId => $destinationId) {
      if ($destinationId === null) {
        continue;
      }
      if (!isset($stateArgs['merryMenMayMove'][$merryManId])) {
        throw new \feException("ERROR 051");
      }
      $option = $stateArgs['merryMenMayMove'][$merryManId];
      $merryMan = $option['merryMan'];
      // $destination = $requiredMoves[$merryMan->getId()];
      if (!in_array($destinationId, $option['spaceIds'])) {
        throw new \feException("ERROR 052");
      }

      $moveInput[] = [
        'force' => $merryMan,
        'toSpaceId' => $destinationId,
        'toHidden' => true,
      ];
    }

    $moveOutput = GameMap::createMoves($moveInput);

    $info = $this->ctx->getInfo();
    $isTemporaryTruce = isset($info['source']) && $info['source'] === 'Event14_TemporaryTruce';
    $player = self::getPlayer();

    Notifications::redeploymentRobinHood($player, $moveOutput['forces'], $moveOutput['moves'], $isTemporaryTruce);
    if ($isTemporaryTruce) {
      Players::moveRoyalFavour($player, 1, JUSTICE);
      $this->ctx->insertAsBrother(new LeafNode([
        'action' => ROYAL_INSPECTION_HIDE_ALL_MERRY_MEN,
        'playerId' => $player->getId(),
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

  public function getOptions()
  {
    $merryMenMustMove = [];
    $merryMenMayMove = [];
    $info = $this->ctx->getInfo();
    $isTemporaryTruce = isset($info['source']) && $info['source'] === 'Event14_TemporaryTruce';

    $spaces = Spaces::getAll();

    $merryMen = Forces::getOfType(MERRY_MEN);
    $merryMen[] = Forces::get(ROBIN_HOOD);
    $camps = Forces::getOfType(CAMP);

    $parishes = Spaces::get(PARISHES)->toArray();
    $parishesWithACampIds = array_map(function ($parish) {
      return $parish->getId();
    }, Utils::filter($parishes, function ($parish) use ($camps) {

      return Utils::array_some($camps, function ($camp) use ($parish) {
        return $camp->getLocation() === $parish->getId();
      });
    }));

    $destinations = array_merge($parishesWithACampIds, [SHIRE_WOOD, SOUTHWELL_FOREST]);

    foreach ($merryMen as $merryMan) {
      $spaceId = $merryMan->getLocation();
      if (in_array($spaceId, [MERRY_MEN_SUPPLY, ROBIN_HOOD_SUPPLY, PRISON, REMOVED_FROM_GAME])) {
        continue;
      }
      $space = $spaces[$spaceId];
      if (in_array($spaceId, PARISHES_AND_NOTTINGHAM) && ($isTemporaryTruce || $space->isSubmissive()) && !in_array($spaceId, $parishesWithACampIds)) {
        $merryMenMustMove[$merryMan->getId()] = [
          'merryMan' => $merryMan,
          'spaceIds' => $destinations,
        ];
      } else {
        $merryMenMayMove[$merryMan->getId()] = [
          'merryMan' => $merryMan,
          'spaceIds' => Utils::filter($destinations, function ($dest) use ($spaceId) {
            return $dest !== $spaceId;
          }),
        ];
      }
    }
    return [
      'spaces' => $spaces,
      'merryMenMayMove' => $merryMenMayMove,
      'merryMenMustMove' => $merryMenMustMove,
    ];
  }
}
