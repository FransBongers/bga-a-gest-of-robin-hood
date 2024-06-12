<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Spaces;

class Event05_LittleJohn extends \AGestOfRobinHood\Models\EventCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event05_LittleJohn';
    $this->title = clienttranslate('Little John');
    $this->titleLight = clienttranslate('Loyal companion');
    $this->textLight = clienttranslate('Reveal Robin Hood to place a Hidden Merry Man in his space and gain 2 Shillings.');
    $this->titleDark = clienttranslate('Foolish bumbler');
    $this->textDark = clienttranslate('Set a Revolting Parish with a Revealed Merry Man to Submissive.');
    $this->carriageMoves = 1;
    $this->eventType = REGULAR_EVENT;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }

  public function resolveLightEffect($player, $successful, $ctx = null, $space = null)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $robinHood->reveal($player);
    if (Forces::countInLocation(MERRY_MEN_SUPPLY) > 0) {
      GameMap::placeMerryMan($player, Spaces::get($robinHood->getLocation()),false);
    }
    $player->incShillings(2);
  }

  public function resolveDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_LITTLE_JOHN,
      'playerId' => $player->getId(),
    ]));
  }

  public function canPerformLightEffect($player)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    return in_array($robinHood->getLocation(), SPACES) && $robinHood->isHidden();
  }

  public function canPerformDarkEffect($player)
  {
    $forces = Forces::getAll()->toArray();
    $parishes = Spaces::getMany(PARISHES)->toArray();

    return Utils::array_some($parishes, function ($parish) use ($forces) {
      return $parish->isRevolting() && Utils::array_some($forces, function ($force) use ($parish) {
        return $force->getLocation() === $parish->getId() && $force->isMerryMan() && !$force->isHidden();
      });
    });
  }
}
