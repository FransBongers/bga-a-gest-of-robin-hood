// ..######......###....##.....##.########....##.....##....###....########.
// .##....##....##.##...###...###.##..........###...###...##.##...##.....##
// .##.........##...##..####.####.##..........####.####..##...##..##.....##
// .##...####.##.....##.##.###.##.######......##.###.##.##.....##.########.
// .##....##..#########.##.....##.##..........##.....##.#########.##.......
// .##....##..##.....##.##.....##.##..........##.....##.##.....##.##.......
// ..######...##.....##.##.....##.########....##.....##.##.....##.##.......

class CardArea {
  protected game: AGestOfRobinHoodGame;

  public stocks: {
    eventsDeck: ManualPositionStock<GestCard>;
    eventsDiscard: ManualPositionStock<GestCard>;
    // travellersDeck: ManualPositionStock<GestCard>;
    // travellersDiscard: ManualPositionStock<GestCard>;
    // travellersVictimsPile: ManualPositionStock<GestCard>;
    travellerRobbed: ManualPositionStock<GestCard>;
  };

  // public counters: {
  //   victimsPile: Counter;
  //   travellersDeck: Counter;
  //   travellersDiscard: Counter;
  //   travellersInDeck: Record<string, Counter>;
  // };
  // public stocks: {
  //   eventsDeck: LineStock<GestCard>;
  //   eventsDiscard: LineStock<GestCard>;
  //   travellersDeck: LineStock<GestCard>;
  //   travellersDiscard: LineStock<GestCard>;
  //   travellersVictimsPile: LineStock<GestCard>;
  // };
  // public forces: Record<string, LineStock<GestForce>> = {};

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
    const gamedatas = game.gamedatas;

    this.setupCardArea({ gamedatas });
  }

  // .##.....##.##....##.########...#######.
  // .##.....##.###...##.##.....##.##.....##
  // .##.....##.####..##.##.....##.##.....##
  // .##.....##.##.##.##.##.....##.##.....##
  // .##.....##.##..####.##.....##.##.....##
  // .##.....##.##...###.##.....##.##.....##
  // ..#######..##....##.########...#######.

  clearInterface() {}

  updateInterface({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    // this.updateCounters({ gamedatas });
  }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  setupStocks({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    this.stocks = {
      eventsDeck: new ManualPositionStock(
        this.game.cardManager,
        document.getElementById('gest_events_deck'),
        {},
        this.game.cardManager.updateDisplay
      ),
      eventsDiscard: new ManualPositionStock(
        this.game.cardManager,
        document.getElementById('gest_events_discard'),
        {},
        this.game.cardManager.updateDisplay
      ),
      // travellersDeck: new ManualPositionStock(
      //   this.game.cardManager,
      //   document.getElementById('gest_travellers_deck'),
      //   {},
      //   this.game.cardManager.updateDisplay
      // ),
      // travellersDiscard: new ManualPositionStock(
      //   this.game.cardManager,
      //   document.getElementById('gest_travellers_discard'),
      //   {},
      //   this.game.cardManager.updateDisplay
      // ),
      travellerRobbed: new ManualPositionStock(
        this.game.cardManager,
        document.getElementById('gest_traveller_robbed'),
        {},
        this.game.cardManager.updateDisplay
      ),
      // travellersVictimsPile: new ManualPositionStock(
      //   this.game.cardManager,
      //   document.getElementById('gest_travellers_vicitimsPile'),
      //   {},
      //   this.game.cardManager.updateDisplay
      // ),
    };

    this.updateCards({ gamedatas });
  }

  updateCards({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    if (gamedatas.cards.eventsDiscard) {
      this.stocks.eventsDiscard.addCard(gamedatas.cards.eventsDiscard);
    }
    if (gamedatas.cards.travellers.travellerRobbed) {
      this.stocks.travellerRobbed.addCard(gamedatas.cards.travellers.travellerRobbed);
    }
    // if (gamedatas.cards.travellersVictimsPile) {
    //   this.stocks.travellersVictimsPile.addCard(
    //     gamedatas.cards.travellersVictimsPile
    //   );
    // }
  }

  // setupCounters({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
  //   this.counters = {
  //     travellersDeck: new ebg.counter(),
  //     travellersDiscard: new ebg.counter(),
  //     travellersInDeck: {},
  //     victimsPile: new ebg.counter(),
  //   };

  //   this.counters.travellersDeck.create('gest_travellers_deck_counter');
  //   this.counters.travellersDiscard.create('gest_travellers_discard_counter');
  //   this.counters.victimsPile.create('gest_victims_pile_counter');
  //   TRAVELLERS.forEach((traveller) => {
  //     this.counters.travellersInDeck[traveller] = new ebg.counter();
  //     this.counters.travellersInDeck[traveller].create(
  //       `gest_traveller_${traveller}_counter`
  //     );
  //   });

  //   this.updateCounters({ gamedatas });
  // }

  // updateCounters({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
  //   this.counters.travellersDeck.setValue(
  //     gamedatas.cards.counts.travellersDeck
  //   );
  //   this.counters.travellersDiscard.setValue(
  //     gamedatas.cards.counts.travellersDiscard
  //   );
  //   this.counters.victimsPile.setValue(
  //     gamedatas.cards.counts.travellersVictimsPile
  //   );
  //   Object.entries(gamedatas.cards.counts.travellers).forEach(
  //     ([traveller, count]) => {
  //       this.setTravellerInDeckCounterValue(traveller, count);
  //       // this.counters.travellersInDeck[traveller].setValue(count);
  //     }
  //   );
  // }

  // Setup functions
  setupCardArea({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    document
      .getElementById('play_area_container')
      .insertAdjacentHTML('beforeend', tplCardArea());
    const cardScale = this.game.settings.get({
      id: PREF_CARD_SIZE,
    });
    const node = document.getElementById('gest_card_area');
    if (node) {
      node.style.setProperty(
        '--gestCardSizeScale',
        `${Number(cardScale) / 100}`
      );
    }

    this.setupStocks({ gamedatas });
    // this.setupCounters({ gamedatas });
    this.game.infoPanel.setupPlotsAndDeedsInfo();
    // this.game.tooltipManager.addTravellersTooltips();
  }

  // ..######...########.########.########.########.########...######.
  // .##....##..##..........##.......##....##.......##.....##.##....##
  // .##........##..........##.......##....##.......##.....##.##......
  // .##...####.######......##.......##....######...########...######.
  // .##....##..##..........##.......##....##.......##...##.........##
  // .##....##..##..........##.......##....##.......##....##..##....##
  // ..######...########....##.......##....########.##.....##..######.

  // ..######..########.########.########.########.########...######.
  // .##....##.##..........##.......##....##.......##.....##.##....##
  // .##.......##..........##.......##....##.......##.....##.##......
  // ..######..######......##.......##....######...########...######.
  // .......##.##..........##.......##....##.......##...##.........##
  // .##....##.##..........##.......##....##.......##....##..##....##
  // ..######..########....##.......##....########.##.....##..######.

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  public updateTooltips() {
    const cards = [...this.stocks.eventsDiscard.getCards(), ...this.stocks.travellerRobbed.getCards()];
    cards.forEach((card) => {
      const cardId = card.id.split('_')[0];
      this.game.tooltipManager.removeTooltip(cardId);
      this.game.tooltipManager.addCardTooltip({
        nodeId: cardId,
        cardId: cardId,
      });
    });
  }

  // private setTravellerInDeckCounterValue(traveller: string, value: number) {
  //   this.counters.travellersInDeck[traveller].setValue(value);
  //   const node = document.getElementById(
  //     `gest_traveller_${traveller}_counter_row`
  //   );
  //   if (!node) {
  //     return;
  //   }
  //   if (value === 0) {
  //     node.classList.add(GEST_NONE);
  //   } else {
  //     node.classList.remove(GEST_NONE);
  //   }
  // }

  // public incTravellerInDeckCounterValue(traveller: string, value: number) {
  //   const counter = this.counters.travellersInDeck[traveller];
  //   counter.incValue(value);
  //   const node = document.getElementById(
  //     `gest_traveller_${traveller}_counter_row`
  //   );
  //   if (!node) {
  //     return;
  //   }
  //   const counterValue = this.counters.travellersInDeck[traveller].getValue();
  //   if (counterValue === 0) {
  //     node.classList.add(GEST_NONE);
  //   } else {
  //     node.classList.remove(GEST_NONE);
  //   }
  // }
}
