<?php

namespace AGestOfRobinHood\Cards\Travellers;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Managers\Players;

class Traveller_RichMerchant extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->title = clienttranslate('Rich Merchant');
    $this->titleLight = clienttranslate('"Invitation" to dinner');
    $this->textLight = clienttranslate('If successful, gain 2 Shillings and put the card in the discard pile. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('Fleece him!');
    $this->textDark = clienttranslate('If successful, gain 4 Shillings and put the card in the Victims Pile. If failed, Sheriff gains 2 Shillings and put the card in the discard pile.');
    $this->strength = 1;
    $this->setupLocation = TRAVELLERS_DECK;
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = null)
  {
    if ($successful) {
      $player->incShillings(4);
      $ctx->insertAsBrother(new LeafNode([
        'action' => PUT_CARD_IN_VICTIMS_PILE,
        'playerId' => $player->getId(),
        'cardId' => $this->getId(),
      ]));
    } else {
      Players::getSheriffPlayer()->incShillings(2);
    }
  }

  public function performLightEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = null)
  {
    if ($successful) {
      $player->incShillings(2);
    }
  }
}
