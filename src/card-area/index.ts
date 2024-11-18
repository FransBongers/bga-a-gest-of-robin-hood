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
    travellerRobbed: ManualPositionStock<GestCard>;
    gestDiscard: VoidStock<GestCard>;
  };

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
      travellersDeck: new ManualPositionStock(
        this.game.cardManager,
        document.getElementById('gest_travellers_deck'),
        {},
        this.game.cardManager.updateDisplay
      ),
      travellerRobbed: new ManualPositionStock(
        this.game.cardManager,
        document.getElementById('gest_traveller_robbed'),
        {},
        this.game.cardManager.updateDisplay
      ),
      gestDiscard: new VoidStock(
        this.game.cardManager,
        document.getElementById('gest_discard')
      ),
    };

    this.updateCards({ gamedatas });
  }

  updateCards({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    const numberOfCardsInDiscard = gamedatas.cards.eventsDiscard.length;
    if (numberOfCardsInDiscard > 0) {
      this.stocks.eventsDiscard.addCard(
        gamedatas.cards.eventsDiscard[numberOfCardsInDiscard - 1]
      );
    }
    if (gamedatas.cards.travellers.travellerRobbed) {
      this.stocks.travellerRobbed.addCard(
        gamedatas.cards.travellers.travellerRobbed
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

    // this.game.tooltipManager.addTextToolTip({
    //   nodeId: 'gest_events_deck',
    //   text: _('Events deck'),
    // });
    // this.game.tooltipManager.addTextToolTip({
    //   nodeId: 'gest_travellers_deck',
    //   text: _('Travellers deck'),
    // });

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
    const cards = [
      ...this.stocks.eventsDiscard.getCards(),
      ...this.stocks.travellerRobbed.getCards(),
    ];
    cards.forEach((card) => {
      const cardId = card.id.split('_')[0];
      this.game.tooltipManager.removeTooltip(cardId);
      this.game.tooltipManager.addCardTooltip({
        nodeId: cardId,
        cardId: cardId,
      });
    });
  }
}
