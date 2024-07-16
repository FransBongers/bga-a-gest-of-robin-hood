<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Stats;
use AGestOfRobinHood\Helpers\Locations;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class PlaceHenchmen extends \AGestOfRobinHood\Actions\Plot
{
  public function getState()
  {
    return ST_PLACE_HENCHMEN;
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

  public function stPlaceHenchmen()
  {

    $count = Forces::getInLocation(HENCHMEN_SUPPLY);

    if ($count === 0) {
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

  public function argsPlaceHenchmen()
  {
    $info = $this->ctx->getInfo();
    $conditions = isset($info['conditions']) ? $info['conditions'] : [];

    $data = $this->getOptions();
    $data['conditions'] = $conditions;
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

  public function actPassPlaceHenchmen()
  {
    $player = self::getPlayer();
    // Stats::incPassActionCount($player->getId(), 1);
    Engine::resolve(PASS);
  }

  public function actPlaceHenchmen($args)
  {
    self::checkAction('actPlaceHenchmen');
    $placedHenchmen = $args['placedHenchmen'];

    $options = $this->getOptions();

    if (count($placedHenchmen) > $options['maxNumber'] || count($placedHenchmen) > count($options['henchmen'])) {
      throw new \feException("ERROR 064");
    }


    $notifData = [];
    foreach ($placedHenchmen as $placeData) {
      $henchmanId = $placeData['henchmanId'];
      $henchman = Utils::array_find($options['henchmen'], function ($force) use ($henchmanId) {
        return $force->getId() === $henchmanId;
      });
      if ($henchman === null) {
        throw new \feException("ERROR 065");
      }
      $spaceId = $placeData['spaceId'];
      if (!isset($options['spaces'][$spaceId])) {
        throw new \feException("ERROR 088");
      }
      $space = $options['spaces'][$spaceId];
      $henchman->setLocation($spaceId);

      if (!isset($notifData[$spaceId])) {
        $notifData[$spaceId] = [
          'forces' => [$henchman],
          'space' => $space,
        ];
      } else {
        $notifData[$spaceId]['forces'][] = $henchman;
      }
    }

    $info = $this->ctx->getInfo();
    $conditions = isset($info['conditions']) ? $info['conditions'] : [];
    if (in_array(ONE_SPACE, $conditions) && count($notifData) > 1) {
      throw new \feException("ERROR 089");
    }

    $player = self::getPlayer();
    foreach ($notifData as $spaceId => $data) {
      Notifications::placeHenchmen($player, $data['forces'], $data['space']);
    }

    if ($info['cardId'] === 'Event21_RobinsHorn' && count(AtomicActions::get(CAPTURE)->getOptions(array_keys($notifData))) > 0) {
      $this->ctx->insertAsBrother(new LeafNode([
        'action' => CAPTURE,
        'playerId' => $player->getId(),
        'optional' => true,
        'spaceIds' => array_keys($notifData),
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


  private function getOptions()
  {
    $info = $this->ctx->getInfo();
    $maxNumber = $info['maxNumber'];
    $locationIds = $info['locationIds'];

    $spaces = Spaces::get($locationIds);

    $henchmen = Forces::getTopOf(HENCHMEN_SUPPLY, $maxNumber, false)->toArray();
    return [
      'spaces' => $spaces,
      'henchmen' => $henchmen,
      'maxNumber' => min(count($henchmen), $maxNumber),
    ];
  }
}
