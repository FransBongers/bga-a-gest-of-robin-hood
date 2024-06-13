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
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class Capture extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_CAPTURE;
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

  public function stCapture()
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

  public function argsCapture()
  {
    $data = [
      'spaces' => $this->getOptions(),
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

  public function actPassCapture()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actCapture($args)
  {
    self::checkAction('actCapture');

    $spaceId = $args['spaceId'];

    $player = self::getPlayer();
    $this->resolveCapture($player, $spaceId);
    

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

  public function resolveCapture($player, $spaceId)
  {

    $options = $this->getOptions();

    $space = Utils::array_find($options, function ($optionSpace) use ($spaceId) {
      return $optionSpace->getId() === $spaceId;
    });

    if ($space === null) {
      throw new \feException("ERROR 039");
    }

    $revealedMerryMen = [];
    $hasHiddenMerryMen = false;
    $revealedRobinHood = null;
    $numberOfHenchmen = 0;
    $camps = [];

    $forces = $space->getForces();

    foreach($forces as $force) {
      if ($force->isMerryMan() && $force->isHidden()) {
        $hasHiddenMerryMen = true;
      } else if ($force->isHenchman()) {
        $numberOfHenchmen++;
      } else if ($force->isMerryManNotRobinHood() && !$force->isHidden()) {
        $revealedMerryMen[] = $force;
      } else if ($force->isRobinHood() && !$force->isHidden()) {
        $revealedRobinHood = $force;
      } else if ($force->isCamp()) {
        $camps[] = $force;
      }
    }

    $maxNumberOfPiecesToCapture = $space->isRevolting() ? floor($numberOfHenchmen / 2) : $numberOfHenchmen;
    $numberOfCapturedRevealedMerryMen = min($maxNumberOfPiecesToCapture, count($revealedMerryMen));
    shuffle($revealedMerryMen);

    $capturedPieces = [];

    for($i = 0; $i < $numberOfCapturedRevealedMerryMen ; $i++) {
      $merryMen = $revealedMerryMen[$i];
      $merryMen->setLocation(PRISON);
      $capturedPieces[] = [
        'force' => $merryMen,
        'type' => MERRY_MEN,
        'hidden' => false,
        'spaceId' => $space->getId(),
      ];
    }

    $remainingPiecesToCapture = $maxNumberOfPiecesToCapture - $numberOfCapturedRevealedMerryMen;

    $robinHoodCaptured = false;
    if ($remainingPiecesToCapture > 0 && $revealedRobinHood !== null) {
      $revealedRobinHood->setLocation(PRISON);
      $capturedPieces[] = [
        'force' => $revealedRobinHood,
        'type' => ROBIN_HOOD,
        'hidden' => false,
        'spaceId' => $space->getId(),
      ];
      $remainingPiecesToCapture--;
      $robinHoodCaptured = true;
    }

    Notifications::captureMerryMen($player, $space, $capturedPieces);

    if ($robinHoodCaptured) {
      Players::moveRoyalFavour($player, 1, ORDER);
    }
    // Notifs
    if (!$hasHiddenMerryMen && $remainingPiecesToCapture > 0 && count($camps) > 0) {
      $numberOfReturnedCamps = min(count($camps), $remainingPiecesToCapture);
      for($j = 0; $j < $numberOfReturnedCamps ; $j++) {
        $camp = $camps[$j];
        $camp->returnToSupply($player);
      }
    }
  }


  public function canBePerformed($player, $availableShillings)
  {
    return count($this->getOptions()) > 0;
  }

  public function getName()
  {
    return clienttranslate('Capture');
  }

  public function getOptions()
  {
    $alreadyCapturedSpaceIds = [];
    $nodes = Engine::getResolvedActions([CAPTURE]);
    foreach ($nodes as $node) {
      $resArgs = $node->getActionResolutionArgs();
      $alreadyCapturedSpaceIds[] = $resArgs['spaceId'];
    }

    $spaces = Utils::filter(Spaces::getAll()->toArray(), function ($space) use ($alreadyCapturedSpaceIds) {
      if ($space->getId() === OLLERTON_HILL || in_array($space->getId(), $alreadyCapturedSpaceIds)) {
        return false;
      }

      $forces = $space->getForces();
      $hasHiddenMerryMen = Utils::array_some($forces, function ($force) {
        return $force->isHidden() && $force->isMerryMan();
      });
      $hasPiecesToRemove = Utils::array_some($forces, function ($force) use ($hasHiddenMerryMen) {
        return !$force->isHidden() && ($force->isMerryMan() || ($force->isCamp() && !$hasHiddenMerryMen));
      });
      $numberOfHenchmen = count(Utils::filter($forces, function ($force) {
        return $force->isHenchman();
      }));
      $hasHenchmen = $space->isRevolting() ? $numberOfHenchmen >= 2 : $numberOfHenchmen > 0;
      return $hasHenchmen && $hasPiecesToRemove;
    });
    return $spaces;
  }
}
