<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Globals;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;

class Event20_MajorOak extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event20_MajorOak';
    $this->title = clienttranslate('Major Oak');
    $this->titleLight = clienttranslate('Sanctuary');
    $this->textLight = clienttranslate('Place a Camp on Ollerton Hill (shift one step towards Justice). For Robin Hood, all spaces adjacent to Ollerton Hill are now adjacent to each other (keep this card as a reminder).');
    $this->titleDark = clienttranslate('Camp destroyed');
    $this->textDark = clienttranslate('Remove a Camp from a Forest space (shift one step towards Order).');
    $this->carriageMoves = 2;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => REMOVE_CAMP,
      'playerId' => $player->getId(),
      'fromSpaceIds' => [SHIRE_WOOD, SOUTHWELL_FOREST],
    ]));
  }

  public function performLightEffect($player, $successful, $ctx = null, $space = null)
  {
    $camp = Forces::getTopOf(CAMPS_SUPPLY);
    $camp->setLocation(OLLERTON_HILL);
    $camp->setHidden(0);
    Notifications::placeForce($player, $camp, Spaces::get(OLLERTON_HILL));
    Players::moveRoyalFavour($player, 1, JUSTICE);
    Globals::setOllertonHillAdjacency(true);
  }

  public function canPerformDarkEffect($player)
  {
    return Utils::array_some(Forces::getOfType(CAMP), function ($camp) {
      return in_array($camp->getLocation(), [SHIRE_WOOD, SOUTHWELL_FOREST]);
    });
  }

  public function canPerformLightEffect($player)
  {
    return count(Forces::getInLocation(CAMPS_SUPPLY)->toArray()) > 0;
  }
}
