<?php

namespace AGestOfRobinHood\Cards\Travellers;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;

class Traveller10_TheMillersSon extends \AGestOfRobinHood\Models\TravellerCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Traveller10_TheMillersSon';
    $this->title = clienttranslate('The Miller’s Son');
    $this->titleLight = clienttranslate('Quick shilling');
    $this->textLight = clienttranslate('If successful, gain 2 Shillings and put the card in the discard pile. If failed, put the card in the discard pile.');
    $this->titleDark = clienttranslate('A new recruit');
    $this->textDark = clienttranslate('If successful, gain 1 Shilling, place a Hidden Merry Man in the Rob space or an adjacent space, and put the card in the Victims Pile. If failed, put a Henchman in the Rob space, then put the card in the discard pile.');
    $this->strength = 0;
    $this->setupLocation = TRAVELLERS_DECK;
  }

  public function performDarkEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = null)
  {
    if ($successful) {
      $player->incShillings(1);
      $ctx->insertAsBrother(new LeafNode([
        'action' => PUT_CARD_IN_VICTIMS_PILE,
        'playerId' => $player->getId(),
        'cardId' => $this->getId(),
      ]));
      $ctx->insertAsBrother(new LeafNode([
        'action' => PLACE_MERRY_MAN_IN_SPACE,
        'playerId' => $player->getId(),
        'spaceIds' => array_merge($space->getAdjacentSpaceIds(), [$space->getId()]),
      ]));
    } else {
      $henchman = Forces::getTopOf(HENCHMEN_SUPPLY);
      if ($henchman !== null && $space !== null) {
        $henchman->setLocation($space->getId());
        Notifications::placeHenchmen(Players::getSheriffPlayer(), [$henchman], $space);
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
      $player->incShillings(2);
    }
    $ctx->insertAsBrother(new LeafNode([
      'action' => PUT_TRAVELLER_IN_DISCARD_PILE,
      'playerId' => $player->getId(),
      'cardId' => $this->getId(),
    ]));
  }
}
