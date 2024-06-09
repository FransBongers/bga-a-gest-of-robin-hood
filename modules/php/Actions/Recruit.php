<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class Recruit extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_RECRUIT;
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

  public function stRecruit()
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

  public function argsRecruit()
  {
    $spaces = $this->getOptions();

    $options = [];
    $playerId = $this->ctx->getPlayerId();

    $merryMenSupply = Forces::getInLocation(MERRY_MEN_SUPPLY)->toArray();
    $supplyCount = count($merryMenSupply);
    $robinHoodInSupply = Utils::array_some($merryMenSupply, function ($merryMan) {
      $merryMan->getId() === ROBIN_HOOD;
    });

    $alreadyRecruitedInSpaceIds = $this->getAlreadyRecruitedSpaceIds();

    foreach ($spaces as $space) {
      if (in_array($space->getId(), $alreadyRecruitedInSpaceIds)) {
        continue;
      }

      $forcesInSpace = $space->getForces();
      $hasCamp = Utils::array_some($forcesInSpace, function ($force) {
        return $force->getType() === CAMP;
      });
      // Can you replace Robin Hood with a camp?
      $merryMen = Utils::filter($forcesInSpace, function ($force) {
        return $force->isMerryMan();
      });
      $recruitOptions = [];
      if ($hasCamp && $supplyCount >= 2) {
        $recruitOptions[] = PLACE_TWO_MERRY_MEN;
      } else if (($hasCamp && $supplyCount === 1) || $supplyCount > 0) {
        $recruitOptions[] = PLACE_MERRY_MAN;
      }
      if (!$hasCamp && count($merryMen) > 0) {
        $recruitOptions[] = REPLACE_MERRY_MAN_WITH_CAMP;
      }
      if ($hasCamp && Utils::array_some($merryMen, function ($merryMan) {
        return !$merryMan->isHidden();
      })) {
        $recruitOptions[] = FLIP_ALL_MERRY_MAN_TO_HIDDEN;
      }

      $options[$space->getId()] = [
        'space' => $space,
        'merryMen' => $merryMen,
        'recruitOptions' => $recruitOptions,
      ];
    }



    $data = [
      '_private' => [
        $playerId => [
          'options' => $options,
          'robinHoodInSupply' => $robinHoodInSupply,
        ],
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

  public function actPassRecruit()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actRecruit($args)
  {
    self::checkAction('actRecruit');


    $merryManId = isset($args['merryManId']) ? $args['merryManId'] : null;
    $recruitOption = $args['recruitOption'];
    $spaceId = $args['spaceId'];
    $recruitRobinHood = isset($args['recruitRobinHood']) ? $args['recruitRobinHood'] : false;


    $player = self::getPlayer();

    $stateArgs = $this->argsRecruit()['_private'][$player->getId()];
    $options = $stateArgs['options'];
    $robinHoodInSupply = $stateArgs['robinHoodInSupply'];

    if ($recruitRobinHood && !$robinHoodInSupply) {
      throw new \feException("ERROR 008");
    }

    if (!isset($options[$spaceId])) {
      throw new \feException("ERROR 009");
    }

    $option = $options[$spaceId];

    if (!in_array($recruitOption, $option['recruitOptions'])) {
      throw new \feException("ERROR 010");
    }

    if ($merryManId !== null && !Utils::array_some($option['merryMen'], function ($merryMan) use ($merryManId) {
      return $merryMan->getId() === $merryManId;
    })) {
      throw new \feException("ERROR 011");
    }

    $player->payShillings(1);
    $space = $option['space'];

    switch ($recruitOption) {
      case PLACE_MERRY_MAN:
      case PLACE_TWO_MERRY_MEN:
        $this->placeMerryMen($player, $recruitOption, $space, $recruitRobinHood);
        break;
      case REPLACE_MERRY_MAN_WITH_CAMP:
        $this->replaceMerryManWithCamp($player, $space, $merryManId);
        break;
      case FLIP_ALL_MERRY_MAN_TO_HIDDEN:
        $this->flipAllMerryMenToHidden($player, $space);
        break;
    }

    $this->insertPlotAction($player);

    $this->resolveAction($args);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  public function canBePerformed($player, $availableShillings)
  {
    if ($availableShillings === 0) {
      return false;
    }

    return count(Utils::filter(Spaces::getAll()->toArray(), function ($space) {
      return $space->getStatus() !== SUBMISSIVE && $space->getId() !== OLLERTON_HILL;
    })) > 0;
  }

  public function getName()
  {
    return clienttranslate('Recruit');
  }

  private function flipAllMerryMenToHidden($player, $space)
  {
    $forces = Forces::getInLocation($space->getId())->toArray();
    $revealedMerryMen = Utils::filter($forces, function ($merryMan) {
      return !$merryMan->isHidden() && $merryMan->getType() === MERRY_MEN || $merryMan->getType() === ROBIN_HOOD;
    });
    foreach ($revealedMerryMen as $force) {
      $force->hide($player);
    }
  }

  private function replaceMerryManWithCamp($player, $space, $merryManId)
  {
    Forces::get($merryManId)->returnToSupply($player);
    $camp = Forces::getTopOf(CAMPS_SUPPLY);
    $camp->setLocation($space->getId());
    if ($space->isForest()) {
      $camp->setHidden(0);
    }
    Notifications::placeForce($player, $camp, $space);
  }

  private function placeMerryMen($player, $recruitOption, $space, $recruitRobinHood)
  {
    $merryMenToPlace = [];
    $robinHood = null;
    $originalNumber = $recruitOption === PLACE_MERRY_MAN ? 1 : 2;
    $numberToPlace = $originalNumber;
    $spaceId = $space->getId();

    if ($recruitRobinHood) {
      $robinHood = Forces::get(ROBIN_HOOD);
      $robinHood->setLocation($spaceId);
      $numberToPlace--;
    }

    for ($i = 0; $i < $numberToPlace; $i++) {
      $merryMan = Forces::getTopOf(MERRY_MEN_SUPPLY);
      $merryMan->setLocation($spaceId);
      $merryMenToPlace[] = $merryMan;
    }

    Notifications::recruitMerryMen($player, $originalNumber, $robinHood, $merryMenToPlace, $space);
  }

  public function getOptions()
  {
    return Utils::filter(Spaces::getAll()->toArray(), function ($space) {
      return $space->getStatus() !== SUBMISSIVE && $space->getId() !== OLLERTON_HILL;
    });
  }

  public function getAlreadyRecruitedSpaceIds()
  {
    $nodes = Engine::getResolvedActions([RECRUIT]);
    $spaceIds = [];
    foreach ($nodes as $node) {
      $spaceIds[] = $node->getActionResolutionArgs()['spaceId'];
    }
    return $spaceIds;
  }
}
