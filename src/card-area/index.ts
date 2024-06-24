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
    travellersDeck: ManualPositionStock<GestCard>;
    travellersDiscard: ManualPositionStock<GestCard>;
    travellersVictimsPile: ManualPositionStock<GestCard>;
  };
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

  updateInterface({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {}

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
      travellersDeck: new ManualPositionStock(
        this.game.cardManager,
        document.getElementById('gest_travellers_deck'),
        {},
        this.game.cardManager.updateDisplay
      ),
      travellersDiscard: new ManualPositionStock(
        this.game.cardManager,
        document.getElementById('gest_travellers_discard'),
        {},
        this.game.cardManager.updateDisplay
      ),
      travellersVictimsPile: new ManualPositionStock(
        this.game.cardManager,
        document.getElementById('gest_travellers_vicitimsPile'),
        {},
        this.game.cardManager.updateDisplay
      ),
    };
    // this.stocks = {
    //   eventsDeck: new LineStock(
    //     this.game.cardManager,
    //     document.getElementById('gest_events_deck'),
    //     {},
    //   ),
    //   eventsDiscard: new LineStock(
    //     this.game.cardManager,
    //     document.getElementById('gest_events_discard'),
    //     {},
    //   ),
    //   travellersDeck: new LineStock(
    //     this.game.cardManager,
    //     document.getElementById('gest_travellers_deck'),
    //     {},
    //   ),
    //   travellersDiscard: new LineStock(
    //     this.game.cardManager,
    //     document.getElementById('gest_travellers_discard'),
    //     {},
    //   ),
    //   travellersVictimsPile: new LineStock(
    //     this.game.cardManager,
    //     document.getElementById('gest_travellers_vicitimsPile'),
    //     {},
    //   ),
    // };

    this.updateCards({ gamedatas });
  }

  updateCards({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    if (gamedatas.cards.eventsDiscard) {
      this.stocks.eventsDiscard.addCard(gamedatas.cards.eventsDiscard);
    }
    if (gamedatas.cards.travellersDiscard) {
      this.stocks.travellersDiscard.addCard(gamedatas.cards.travellersDiscard);
    }
    if (gamedatas.cards.travellersVictimsPile) {
      this.stocks.travellersVictimsPile.addCard(
        gamedatas.cards.travellersVictimsPile
      );
    }
  }

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
    this.game.infoPanel.setupPlotsAndDeedsInfo();
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
}
