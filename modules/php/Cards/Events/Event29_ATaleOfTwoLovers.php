<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Helpers\GameMap;

class Event29_ATaleOfTwoLovers extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event29_ATaleOfTwoLovers';
    $this->title = clienttranslate('A Tale of Two Lovers');
    $this->titleLight = clienttranslate('Allan-a-Dale marries Ellen');
    $this->textLight = clienttranslate('Pay 1 Shilling and, in a single space, remove one Merry Man and up to 2 Henchmen from the game, then shift one step towards Justice.');
    $this->titleDark = clienttranslate('Edward of Deirwold supports the Sheriff');
    $this->textDark = clienttranslate('Gain 2 Shillings and place up to 2 Henchmen in any one Parish.');
    $this->carriageMoves = 1;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }

  public function performLightEffect($player, $successful, $ctx = null, $space = null)
  {
    $player->payShillings(1);

    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_A_TALE_OF_TWO_LOVERS_LIGHT,
      'playerId' => $player->getId(),
    ]));
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $player->incShillings(2);

    $ctx->insertAsBrother(new LeafNode([
      'action' => PLACE_HENCHMEN,
      'playerId' => $player->getId(),
      'maxNumber' => 2,
      'locationIds' => PARISHES,
      'cardId' => $this->id,
      'conditions' => [ONE_SPACE]
    ]));
  }

  public function canPerformLightEffect($player)
  {
    return $player->getShillings() > 0 && GameMap::merryManAreOnTheMap();
  }
}
