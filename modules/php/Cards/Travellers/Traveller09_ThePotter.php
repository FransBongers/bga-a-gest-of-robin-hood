<?php

namespace AGestOfRobinHood\Cards\Travellers;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Managers\Players;

class Traveller09_ThePotter extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller09_ThePotter';
    $this->title = clienttranslate('The Potter');
    $this->titleLight = clienttranslate('Road toll');
    $this->textLight = clienttranslate('If successful, gain 3 Shillings and put the card in the discard pile. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('A clever trick');
    $this->textDark = clienttranslate('If successful, place Robin Hood revealed adjacent to Nottingham, gain 2 Shillings from the Sheriff and +1 Justice, then put the card in the Victims Pile. If failed, send Robin Hood to Prison (+1 Order) and put the card in the discard pile.');
    $this->strength = 1;
    $this->setupLocation = TRAVELLERS_DECK;
  }

  public function resolveLightEffect($player, $successful, $ctx = null, $space = null)
  {
    if ($successful) {
      $player->incShillings(3);
    }
  }

  public function resolveDarkEffect($player, $successful, $ctx = null, $space = null)
  {
  }
}
