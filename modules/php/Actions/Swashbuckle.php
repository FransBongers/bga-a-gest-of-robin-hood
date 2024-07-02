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
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class Swashbuckle extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_SWASHBUCKLE;
  }

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  public function argsSwashbuckle()
  {
    $info = $this->ctx->getInfo();
    $mayUseAnyMerryMen = isset($info['source']) && $info['source'] === 'Event24_MaidMarian';

    $data = [
      '_private' => [
        self::getPlayer()->getId() => $this->getOptions($mayUseAnyMerryMen),
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

  public function actPassSwashbuckle()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actSwashbuckle($args)
  {
    self::checkAction('actSwashbuckle');
    $robinHoodId = $args['robinHoodId']; // This can actually be a Merry Man with Maid Marian event
    $robinHoodSpaceId = $args['robinHoodSpaceId'];
    $merryManSpaceId = isset($args['merryManSpaceId']) ? $args['merryManSpaceId'] : null;
    $merryManId = isset($args['merryManId']) ? $args['merryManId'] : null;

    $info = $this->ctx->getInfo();
    $mayUseAnyMerryMen = isset($info['source']) && $info['source'] === 'Event24_MaidMarian';
    $availableOptions = $this->getOptions($mayUseAnyMerryMen);

    $options = Utils::array_find($availableOptions, function ($availableOption) use ($robinHoodId) {
      return $availableOption['merryMan']->getId() === $robinHoodId;
    });

    if ($options === null) {
      throw new \feException("ERROR 094");
    }

    $robinHoodSpace = Utils::array_find($options['spaces'], function ($space) use ($robinHoodSpaceId) {
      return $space->getId() === $robinHoodSpaceId;
    });

    if ($robinHoodSpace === null) {
      throw new \feException("ERROR 037");
    }

    $merryManSpace = $merryManSpaceId === null ? null : Utils::array_find($options['spaces'], function ($space) use ($merryManSpaceId) {
      return $space->getId() === $merryManSpaceId;
    });

    if ($merryManSpaceId !== null && $merryManSpace === null) {
      throw new \feException("ERROR 037");
    }

    $merryMan = $merryManId === null ? null :  Utils::array_find($options['merryMenInSpace'], function ($merryMan) use ($merryManId) {
      return $merryMan->getId() === $merryManId;
    });

    if ($merryManId !== null && $merryMan === null) {
      throw new \feException("ERROR 038");
    }

    $player = self::getPlayer();

    $robinHood = Forces::get($robinHoodId);
    $robinHoodFromLocation = $robinHood->getLocation();


    $moves = [];
    $forces = [];

    if ($options['fromPrison']) {
      $notifData = GameMap::createMoves([[
        'force' => $robinHood,
        'toSpaceId' => $robinHoodSpaceId,
        'toHidden' => false,
      ]]);
      $moves = $notifData['moves'];
      $forces = $notifData['forces'];
    } else {
      $createMovesInput = [];
      if (!$robinHood->isHidden()) {
        $robinHood->hide($player);
      }
      $createMovesInput[] = [
        'force' => $robinHood,
        'toSpaceId' => $robinHoodSpaceId,
        'toHidden' => true,
      ];

      if ($merryMan !== null) {
        if (!$merryMan->isHidden()) {
          $merryMan->hide($player);
        }
        $createMovesInput[] = [
          'force' => $merryMan,
          'toSpaceId' => $merryManSpaceId,
          'toHidden' => true,
        ];
      }

      shuffle($createMovesInput);

      $notifData = GameMap::createMoves($createMovesInput);
      $moves = $notifData['moves'];
      $forces = $notifData['forces'];

      //     foreach ($forcesToMove as $force) {
      //   $moves[] = [
      //     'force' => $force,
      //     'from' => [
      //       'hidden' => true,
      //       'spaceId' => $robinHoodFromLocation,
      //       'space' => $fromSpace,
      //     ],
      //     'to' => [
      //       'hidden' => true,
      //       'spaceId' => $force->getId() === $robinHood->getId() ? $robinHoodSpaceId : $merryManSpaceId,
      //       'space' => $force->getId() === $robinHood->getId() ? $robinHoodSpace : $merryManSpace,
      //     ]
      //   ];
      // }


    }
    $fromSpace = $robinHoodFromLocation === PRISON ? PRISON : Spaces::get($robinHoodFromLocation);
    Notifications::swashbuckleMoves($player, $forces, $moves, $fromSpace);

    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  public function getName()
  {
    return clienttranslate('Swashbuckle');
  }

  public function canBePerformed($player, $mayUseAnyMerryMen = false)
  {
    // return Forces::get(ROBIN_HOOD)->getLocation() !== ROBIN_HOOD_SUPPLY;
    return count($this->getOptions($mayUseAnyMerryMen)) > 0;
  }


  public function getOptions($mayUseAnyMerryMen = false)
  {
    $options = [];

    $merryMenThatCanPerform = [];
    if ($mayUseAnyMerryMen) {
      $merryMenThatCanPerform = Utils::filter(Forces::getOfType(MERRY_MEN), function ($force) {
        return !in_array($force->getLocation(),[MERRY_MEN_SUPPLY, REMOVED_FROM_GAME]);
      });
    }
    $robinHood = Forces::get(ROBIN_HOOD);
    if (!in_array($robinHood->getLocation(),[ROBIN_HOOD_SUPPLY, REMOVED_FROM_GAME])) {
      $merryMenThatCanPerform[] = $robinHood;
    }

    foreach ($merryMenThatCanPerform as $merryMan) {
      $location = $merryMan->getLocation();

      if ($location === PRISON) {
        $nottingham = Spaces::get(NOTTINGHAM);
        $options[] = [
          'merryMan' => $merryMan,
          'spaces' => array_merge([$nottingham], $nottingham->getAdjacentSpaces()),
          'fromPrison' => true,
          'merryMenInSpace' => [],
        ];
      } else {
        $merryManSpace = Spaces::get($location);
        $options[] = [
          'merryMan' => $merryMan,
          'spaces' => $merryManSpace->getAdjacentSpaces(),
          'fromPrison' => false,
          'merryMenInSpace' => Utils::filter($merryManSpace->getForces(), function ($force) use ($merryMan) {
            return $force->isMerryMan() && $force->getId() !== $merryMan->getId();
          }),
        ];
      }
    }

    // $robinHoodLocation = Forces::get(ROBIN_HOOD)->getLocation();
    // if ($robinHoodLocation === PRISON) {
    //   $nottingham = Spaces::get(NOTTINGHAM);
    //   return [
    //     'spaces' => array_merge([$nottingham], $nottingham->getAdjacentSpaces()),
    //     'robinHoodInPrison' => true,
    //     'merryMen' => [],
    //   ];
    // }
    // $currentSpace = Spaces::get($robinHoodLocation);
    // return [
    //   'spaces' => $currentSpace->getAdjacentSpaces(),
    //   'robinHoodInPrison' => false,
    //   'merryMen' => Utils::filter($currentSpace->getForces(), function ($force) {
    //     return $force->isMerryManNotRobinHood();
    //   }),
    // ];

    return $options;
  }
}
