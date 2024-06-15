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
    $data = [
      '_private' => [
        self::getPlayer()->getId() => $this->getOptions(),
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
    $robinHoodSpaceId = $args['robinHoodSpaceId'];
    $merryManSpaceId = isset($args['merryManSpaceId']) ? $args['merryManSpaceId'] : null;
    $merryManId = isset($args['merryManId']) ? $args['merryManId'] : null;

    $options = $this->getOptions();

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

    $merryMan = $merryManId === null ? null :  Utils::array_find($options['merryMen'], function ($merryMan) use ($merryManId) {
      return $merryMan->getId() === $merryManId;
    });

    if ($merryManId !== null && $merryMan === null) {
      throw new \feException("ERROR 038");
    }

    $player = self::getPlayer();

    $robinHood = Forces::get(ROBIN_HOOD);
    $robinHoodFromLocation = $robinHood->getLocation();


    $moves = [];

    if ($options['robinHoodInPrison']) {
      $robinHood->setLocation($robinHoodSpaceId);
      $moves[] = [
        'force' => $robinHood,
        'from' => [
          'hidden' => false,
          'spaceId' => PRISON,
        ],
        'to' => [
          'hidden' => false,
          'spaceId' => $robinHoodSpaceId,
        ]
      ];
    } else {
      if (!$robinHood->isHidden()) {
        $robinHood->hide($player);
      }
      $robinHood->setLocation($robinHoodSpaceId);
      $forcesToMove = [$robinHood];
      if ($merryMan !== null) {
        if (!$merryMan->isHidden()) {
          $merryMan->hide($player);
        }
        $merryMan->setLocation($merryManSpaceId);
        $forcesToMove[] = $merryMan;
      }

      shuffle($forcesToMove);

      $fromSpace = Spaces::get($robinHoodFromLocation);

      foreach ($forcesToMove as $force) {
        $moves[] = [
          'force' => $force,
          'from' => [
            'hidden' => true,
            'spaceId' => $robinHoodFromLocation,
            'space' => $fromSpace,
          ],
          'to' => [
            'hidden' => true,
            'spaceId' => $force->isRobinHood() ? $robinHoodSpaceId : $merryManSpaceId,
            'space' => $force->isRobinHood() ? $robinHoodSpace : $merryManSpace,
          ]
        ];
      }

      Notifications::swashbuckleMoves($player, $moves, $fromSpace);
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

  public function getName()
  {
    return clienttranslate('Swashbuckle');
  }

  public function canBePerformed($player)
  {
    return Forces::get(ROBIN_HOOD)->getLocation() !== ROBIN_HOOD_SUPPLY;
  }


  public function getOptions()
  {
    $robinHoodLocation = Forces::get(ROBIN_HOOD)->getLocation();
    if ($robinHoodLocation === PRISON) {
      $nottingham = Spaces::get(NOTTINGHAM);
      return [
        'spaces' => array_merge([$nottingham], $nottingham->getAdjacentSpaces()),
        'robinHoodInPrison' => true,
        'merryMen' => [],
      ];
    }
    $currentSpace = Spaces::get($robinHoodLocation);
    return [
      'spaces' => $currentSpace->getAdjacentSpaces(),
      'robinHoodInPrison' => false,
      'merryMen' => Utils::filter($currentSpace->getForces(), function ($force) {
        return $force->isMerryManNotRobinHood();
      }),
    ];
  }
}
