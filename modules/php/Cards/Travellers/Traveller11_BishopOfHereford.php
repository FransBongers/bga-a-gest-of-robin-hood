<?php

namespace AGestOfRobinHood\Cards\Travellers;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;

class Traveller11_BishopOfHereford extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller11_BishopOfHereford';
    $this->title = clienttranslate('Bishop Of Hereford');
    $this->titleLight = clienttranslate('Forced donation');
    $this->textLight = clienttranslate('If successful, gain 3 Shillings and discard the card. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('Repent!');
    $this->textDark = clienttranslate('If successful, gain 6 Shillings and put the card in the Victims Pile. If failed, the Sheriff gains 3 Shillings and sets the space to Submissive (if possible), then put the card in the discard pile.');
    $this->strength = 1;
    $this->setupLocation = TRAVELLERS_POOL;
    $this->travellerOrder = 6;
  }

  public function performLightEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = null)
  {
    if ($successful) {
      $player->incShillings(3);
    }
    $ctx->insertAsBrother(new LeafNode([
      'action' => PUT_TRAVELLER_IN_DISCARD_PILE,
      'playerId' => $player->getId(),
      'cardId' => $this->getId(),
    ]));
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = null)
  {
    if ($successful) {
      $player->incShillings(6);
      $ctx->insertAsBrother(new LeafNode([
        'action' => PUT_CARD_IN_VICTIMS_PILE,
        'playerId' => $player->getId(),
        'cardId' => $this->getId(),
      ]));
    } else {
      $sheriff = Players::getSheriffPlayer();
      $sheriff->incShillings(3);
      if ($space !== null && $space->isParish() && $space->isRevolting()) {
        $space->setToSubmissive($sheriff);
      }
      $ctx->insertAsBrother(new LeafNode([
        'action' => PUT_TRAVELLER_IN_DISCARD_PILE,
        'playerId' => $player->getId(),
        'cardId' => $this->getId(),
      ]));
    }
  }
}
