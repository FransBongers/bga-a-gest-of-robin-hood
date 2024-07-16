<?php

namespace AGestOfRobinHood\Cards\Travellers;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;

class Traveller_Monk extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->title = clienttranslate('Monks');
    $this->titleLight = clienttranslate('Forced charity');
    $this->textLight = clienttranslate('If successful, gain 1 Shilling and put the card in the discard pile. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('Brutal punishment!');
    $this->textDark = clienttranslate('If successful, gain 3 Shillings and put the card in the Victims Pile. If failed, set the space to Submissive (if possible) and put the card in the discard pile.');
    $this->strength = 0;
    $this->setupLocation = TRAVELLERS_DECK;
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = null)
  {
    if ($successful) {
      $player->incShillings(3);
      $ctx->insertAsBrother(new LeafNode([
        'action' => PUT_CARD_IN_VICTIMS_PILE,
        'playerId' => $player->getId(),
        'cardId' => $this->getId(),
      ]));
    } else {
      if ($space->isParish() && !$space->isSubmissive()) {
        $space->setToSubmissive($player);
      }
      $ctx->insertAsBrother(new LeafNode([
        'action' => PUT_TRAVELLER_IN_DISCARD_PILE,
        'playerId' => $player->getId(),
        'cardId' => $this->getId(),
      ]));
    }
  }

  public function performLightEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = null)
  {
    if ($successful) {
      $player->incShillings(1);
    }
    $ctx->insertAsBrother(new LeafNode([
      'action' => PUT_TRAVELLER_IN_DISCARD_PILE,
      'playerId' => $player->getId(),
      'cardId' => $this->getId(),
    ]));
  }
}
