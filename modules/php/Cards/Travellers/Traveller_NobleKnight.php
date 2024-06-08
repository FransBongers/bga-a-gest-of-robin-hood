<?php

namespace AGestOfRobinHood\Cards\Travellers;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Managers\Players;

class Traveller_NobleKnight extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->title = clienttranslate('Noble Knight');
    $this->titleLight = clienttranslate('Pas d’armes');
    $this->textLight = clienttranslate('If successful, gain 3 Shillings and put the card in the discard pile. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('Mug him!');
    $this->textDark = clienttranslate('If successful, gain 5 Shillings and put the card in the Victims Pile. If failed, send the Robbing Merry Men to Prison and put the card in the discard pile.');
    $this->strength = 2;
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
    if ($successful) {
      $player->incShillings(5);
      $ctx->insertAsBrother(new LeafNode([
        'action' => PUT_CARD_IN_VICTIMS_PILE,
        'playerId' => $player->getId(),
        'cardId' => $this->getId(),
      ]));
    } else {
      //  TODO: capture merry men

    }
  }
}
