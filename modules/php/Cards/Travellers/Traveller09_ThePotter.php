<?php

namespace AGestOfRobinHood\Cards\Travellers;

use AGestOfRobinHood\Core\Engine\LeafNode;
use AGestOfRobinHood\Core\Notifications;
use AGestOfRobinHood\Helpers\GameMap;
use AGestOfRobinHood\Helpers\Utils;
use AGestOfRobinHood\Managers\AtomicActions;
use AGestOfRobinHood\Managers\Cards;
use AGestOfRobinHood\Managers\Forces;
use AGestOfRobinHood\Managers\Players;
use AGestOfRobinHood\Managers\Spaces;

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

  // ..######..##.....##..#######...#######...######..########
  // .##....##.##.....##.##.....##.##.....##.##....##.##......
  // .##.......##.....##.##.....##.##.....##.##.......##......
  // .##.......#########.##.....##.##.....##..######..######..
  // .##.......##.....##.##.....##.##.....##.......##.##......
  // .##....##.##.....##.##.....##.##.....##.##....##.##......
  // ..######..##.....##..#######...#######...######..########

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

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
      $ctx->insertAsBrother(new LeafNode([
        'action' => EVENT_SELECT_SPACE,
        'playerId' => $player->getId(),
        'cardId' => $this->id,
        'effect' => DARK,
      ]));
    } else {
      $robinHood = Forces::get(ROBIN_HOOD);
      if ($robinHood->getLocation() !== PRISON) {
        $data = GameMap::createMoves([
          [
            'force' => $robinHood,
            'toSpaceId' => PRISON,
            'toHidden' => false,
          ]
        ]);
        Notifications::robThePotterDarkFail($player, $data['forces'], $data['moves']);
      } else {
        // Send message that RH is already in Prison?
      }
      Players::moveRoyalFavour(Players::getSheriffPlayer(), 1, ORDER);
      $ctx->insertAsBrother(new LeafNode([
        'action' => PUT_TRAVELLER_IN_DISCARD_PILE,
        'playerId' => $player->getId(),
        'cardId' => $this->getId(),
      ]));
    }
  }


  // .########..########..######...#######..##.......##.....##.########
  // .##.....##.##.......##....##.##.....##.##.......##.....##.##......
  // .##.....##.##.......##.......##.....##.##.......##.....##.##......
  // .########..######....######..##.....##.##.......##.....##.######..
  // .##...##...##.............##.##.....##.##........##...##..##......
  // .##....##..##.......##....##.##.....##.##.........##.##...##......
  // .##.....##.########..######...#######..########....###....########

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  public function resolveDarkEffectAutomatically($player, $ctx)
  {
    return false;
  }

  public function resolveDarkEffect($player, $ctx, $space)
  {
    $robinHood = Forces::get(ROBIN_HOOD);
    $data = GameMap::createMoves([
      [
        'force' => $robinHood,
        'toSpaceId' => $space->getId(),
        'toHidden' => false,
      ]
    ]);
    Notifications::robThePotterDarkSuccess($player, $data['forces'], $data['moves'], $space);
    AtomicActions::get(ROB)->takeShillingsFromTheSheriff($player);
    $ctx->insertAsBrother(new LeafNode([
      'action' => PUT_CARD_IN_VICTIMS_PILE,
      'playerId' => $player->getId(),
      'cardId' => $this->getId(),
    ]));
  }



  public function getDarkStateArgs()
  {
    return [
      'spaces' => $this->getDarkOptions(),
      'title' => clienttranslate('${you} must select a space to place Robin Hood'),
      'confirmText' => clienttranslate('Place Robin Hood in ${spaceName}?'),
      'titleOther' => clienttranslate('${actplayer} must select a space to place Robin Hood'),
    ];
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  private function getDarkOptions()
  {
    return Spaces::get(NOTTINGHAM)->getAdjacentSpaces();
  }
}
