<?php

namespace AGestOfRobinHood\Cards\Travellers;

use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;

class Traveller05_RichardAtTheLea extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller05_RichardAtTheLea';
    $this->title = clienttranslate('Richard At the Lea');
    $this->titleLight = clienttranslate('Extortion');
    $this->textLight = clienttranslate('If successful, gain 2 Shillings and put the card in the discard pile. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('Lend money');
    $this->textDark = clienttranslate('Spend 3 Shillings without rolling to set Retford to Revolting and place a Camp there (shift one step towards Justice), then remove the card from the game.');
    $this->strength = 1;
    $this->setupLocation = TRAVELLERS_DECK;
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = null)
  {
    $player->payShillings(3);
    $retford = Spaces::get(RETFORD);
    if (!$retford->isRevolting()) {
      $retford->revolt($player);
    }
    $camp = Forces::getTopOf(CAMPS_SUPPLY);
    if ($camp !== null) {
      $camp->setLocation(RETFORD);
      Notifications::placeForce($player, $camp, $retford);
      Players::moveRoyalFavour($player, 1, JUSTICE);
    }
    $this->removeFromGame($player);
  }

  public function performLightEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = null)
  {
    if ($successful) {
      $player->incShillings(2);
    }
    $ctx->insertAsBrother(new LeafNode([
      'action' => PUT_TRAVELLER_IN_DISCARD_PILE,
      'playerId' => $player->getId(),
      'cardId' => $this->getId(),
    ]));
  }

  public function canPerformDarkEffect($player)
  {
    return $player->getShillings() >= 3;
  }

  public function requiresRoll($darkOrLight)
  {
    if ($darkOrLight === 'dark') {
      return false;
    }
    return true;
  }
}
