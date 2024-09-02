<?php

namespace AGestOfRobinHood\Cards\Travellers;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Managers\Forces;
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
    $this->travellerOrder = 2;
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

  public function performDarkEffect($player, $successful, $ctx = null, $space = null, $merryMenIds = [])
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
      $merryMen = Forces::getMany($merryMenIds)->toArray();
      $notifInput = GameMap::createMoves(array_map(function ($merryMan) {
        return [
          'force' => $merryMan,
          'toSpaceId' => PRISON,
          'toHidden' => false,
        ];
      }, $merryMen));
      Notifications::robCaptureRobbingMerryMen($player, $notifInput['forces'], $notifInput['moves']);
      if (in_array(ROBIN_HOOD, $merryMenIds)) {
        Players::moveRoyalFavour($player, 1, ORDER);
      }
      $ctx->insertAsBrother(new LeafNode([
        'action' => PUT_TRAVELLER_IN_DISCARD_PILE,
        'playerId' => $player->getId(),
        'cardId' => $this->getId(),
      ]));
    }
  }
}
