<?php

namespace AGestOfRobinHood\Cards\Events;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;

class Event13_Ambush extends \AGestOfRobinHood\Cards\Events\RegularEvent
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Event13_Ambush';
    $this->title = clienttranslate('Ambush');
    $this->titleLight = clienttranslate('Perfect hiding places');
    $this->textLight = clienttranslate('Move any number of Merry Men to a space with a Carriage, flip them Hidden, and attempt a Rob there now.');
    $this->titleDark = clienttranslate('Easy to detect');
    $this->textDark = clienttranslate('Reveal all Merry Men in a Forest and shift one step towards Order.');
    $this->carriageMoves = 1;
    $this->setupLocation = REGULAR_EVENTS_POOL;
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null)
  {
    $ctx->insertAsBrother(new LeafNode([
      'action' => EVENT_AMBUSH_DARK,
      'playerId' => $player->getId(),
      'cardId' => $this->getId(),
    ]));
  }
}
