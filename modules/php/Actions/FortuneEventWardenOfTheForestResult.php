<?php

namespace AGestOfRobinHood\Actions;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Markers;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;


class FortuneEventWardenOfTheForestResult extends \AGestOfRobinHood\Models\AtomicAction
{
  public function getState()
  {
    return ST_FORTUNE_EVENT_WARDEN_OF_THE_FOREST_RESULT;
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

  public function stFortuneEventWardenOfTheForestResult()
  {
    $parishes = Spaces::get(PARISHES)->toArray();

    $count = count(Utils::filter($parishes, function ($parish) {
      return $parish->isSubmissive();
    }));
    if ($count >= 5) {
      Players::moveRoyalFavour(Players::getSheriffPlayer(), 1, ORDER);
    } else {
      Players::moveRoyalFavour(Players::getRobinHoodPlayer(), 1, JUSTICE);
    }

    $this->resolveAction(['automatic' => true]);
  }
}
