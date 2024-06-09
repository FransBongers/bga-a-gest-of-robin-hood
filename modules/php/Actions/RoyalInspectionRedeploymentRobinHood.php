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
    $data = [
      '_private' => [
        $this->ctx->getPlayerId() => $this->getOptions(),
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

  public function actPassRoyalInspectionRedeploymentRobinHood()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actRoyalInspectionRedeploymentRobinHood($args)
  {
    self::checkAction('actRoyalInspectionRedeploymentRobinHood');

    $requiredMoves = $args['requiredMoves'];
    $optionalMoves = $args['optionalMoves'];

    Notifications::log('optionalMoves', $optionalMoves);

    $stateArgs = $this->getOptions();

    $forces = [];
    $moves = [];

    // $moves[] = [
    //   'force' => $robinHood,
    //   'from' => [
    //     'hidden' => false,
    //     'spaceId' => PRISON,
    //   ],
    //   'to' => [
    //     'hidden' => false,
    //     'spaceId' => $robinHoodSpaceId,
    //   ]
    // ];

    foreach ($stateArgs['merryMenMustMove'] as $merryManId => $option) {
      $merryMan = $option['merryMan'];
      $destination = $requiredMoves[$merryMan->getId()];
      if (!in_array($destination, $option['spaceIds'])) {
        throw new \feException("ERROR 050");
      }
      $currentLocation = $merryMan->getLocation();
      $merryMan->setLocation($destination);
      $forces[] = $merryMan;
      $moves[] = [
        'from' => [
          'type' => MERRY_MEN,
          'hidden' => true,
          'spaceId' => $currentLocation,
        ],
        'to' => [
          'type' => MERRY_MEN,
          'hidden' => true,
          'spaceId' => $destination,
        ]
      ];
    }

    // foreach ($optionalMoves as $henchmanId) {
    //   if (!isset($stateArgs['henchmenMayMove'][$henchmanId])) {
    //     throw new \feException("ERROR 049");
    //   }
    //   $henchman = $stateArgs['henchmenMayMove'][$henchmanId]['henchman'];
    //   $henchman->setLocation(NOTTINGHAM);
    //   $forces[] = $henchman;
    // }
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
      $currentLocation = $merryMan->getLocation();
      $merryMan->setLocation($destinationId);
      $forces[] = $merryMan;
      $moves[] = [
        'from' => [
          'type' => MERRY_MEN,
          'hidden' => true,
          'spaceId' => $currentLocation,
        ],
        'to' => [
          'type' => MERRY_MEN,
          'hidden' => true,
          'spaceId' => $destinationId,
        ]
      ];
    }

    Notifications::redeploymentRobinHood(self::getPlayer(), $forces, $moves);

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

    $spaces = Spaces::getAll();
    $spacesArray = $spaces->toArray();

    $merryMen = Forces::getOfType(MERRY_MEN);
    $merryMen[] = Forces::get(ROBIN_HOOD);
    $camps = Forces::getOfType(CAMP);

    $parishesWithACampIds = array_map(function ($parish) {
      return $parish->getId();
    }, Utils::filter($spacesArray, function ($parish) use ($camps) {
      return Utils::array_some($camps, function ($camp) use ($parish) {
        return $camp->getLocation() === $parish->getId();
      });
    }));

    $destinations = array_merge($parishesWithACampIds, [SHIRE_WOOD, SOUTHWELL_FOREST]);

    foreach ($merryMen as $merryMan) {
      $spaceId = $merryMan->getLocation();
      if (in_array($spaceId, [MERRY_MEN_SUPPLY, ROBIN_HOOD_SUPPLY, PRISON])) {
        continue;
      }
      $space = $spaces[$spaceId];
      if ($space->isParish() && $space->isSubmissive() && !in_array($spaceId, $parishesWithACampIds)) {
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
