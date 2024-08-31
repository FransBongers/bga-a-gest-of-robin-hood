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

    if (!$this->canBePerformed($player, $player->getShillings(), $this->getCost())) {
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
    $options = $this->getOptions();
    $playerId = $this->ctx->getPlayerId();

    $robinHoodInSupply = Forces::get(ROBIN_HOOD)->getLocation() === ROBIN_HOOD_SUPPLY;


    $data = [
      '_private' => [
        $playerId => [
          'options' => $options,
          'robinHoodInSupply' => $robinHoodInSupply,
          'merryMenInSupply' => count(Forces::getInLocation(MERRY_MEN_SUPPLY)) > 0,
          'cost' => $this->getCost(),
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

    $cost = $this->getCost();

    if ($cost > 0) {
      $player->payShillings($cost);
    }
    
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

  private function getCost() {
    $info = $this->ctx->getInfo();
    return isset($info['cost']) ? $info['cost'] : 1;
  }

  public function canBePerformed($player, $availableShillings, $cost = null)
  {
    if (($cost === null && $availableShillings === 0) || ($cost !== null && $availableShillings < $cost)) {
      return false;
    }

    return count($this->getOptions()) > 0;
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
    GameMap::placeCamp($player, $space);
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
    $spaces = Utils::filter(Spaces::getAll()->toArray(), function ($space) {
      return $space->getStatus() !== SUBMISSIVE && $space->getId() !== OLLERTON_HILL;
    });

    $options = [];

    $merryMenSupply = Forces::getInLocation(MERRY_MEN_SUPPLY)->toArray();
    $supplyCount = count($merryMenSupply);
    $campInSupply = Forces::countInLocation(CAMPS_SUPPLY) > 0;

    $robinHoodInSupply = Forces::get(ROBIN_HOOD)->getLocation() === ROBIN_HOOD_SUPPLY;
    if ($robinHoodInSupply) {
      $supplyCount += 1;
    }

    $alreadyRecruitedInSpaceIds = $this->getAlreadyRecruitedSpaceIds();

    foreach ($spaces as $space) {
      if (in_array($space->getId(), $alreadyRecruitedInSpaceIds)) {
        continue;
      }

      $forcesInSpace = $space->getForces();
      $hasCamp = Utils::array_some($forcesInSpace, function ($force) {
        return $force->getType() === CAMP;
      });

      $merryMen = Utils::filter($forcesInSpace, function ($force) {
        return $force->isMerryMan();
      });
      $merryMenNotRobinHood = Utils::filter($forcesInSpace, function ($force) {
        return $force->isMerryManNotRobinHood();
      });

      $recruitOptions = [];
      if ($supplyCount > 0) {
        $recruitOptions[] = PLACE_MERRY_MAN;
      }
      if ($hasCamp && $supplyCount >= 2) {
        $recruitOptions[] = PLACE_TWO_MERRY_MEN;
      } 
      if (!$hasCamp && $campInSupply && count($merryMenNotRobinHood) > 0) {
        $recruitOptions[] = REPLACE_MERRY_MAN_WITH_CAMP;
      }
      if ($hasCamp && Utils::array_some($merryMen, function ($merryMan) {
        return !$merryMan->isHidden();
      })) {
        $recruitOptions[] = FLIP_ALL_MERRY_MAN_TO_HIDDEN;
      }

      if (count($recruitOptions) > 0) {
        $options[$space->getId()] = [
          'space' => $space,
          'merryMen' => $merryMenNotRobinHood,
          'recruitOptions' => $recruitOptions,
        ];
      }
    }
    return $options;
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
