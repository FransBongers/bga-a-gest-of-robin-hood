class TravellersInfoPanel {
  protected game: AGestOfRobinHoodGame;

  public travellers: {
    [TRAVELLERS_DECK]?: TravellersRow;
    [TRAVELLERS_DISCARD]?: TravellersRow;
    [TRAVELLERS_VICTIMS_PILE]?: TravellersRow;
    [TRAVELLERS_POOL]?: TravellersRow;
  } = {};

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
    const gamedatas = game.gamedatas;

    this.setup({ gamedatas });
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

  // Setup functions
  setup({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    const node = document.getElementById('player_boards');
    if (!node) {
      return;
    }
    node.insertAdjacentHTML('beforeend', tplTravellersInfoPanel());

    const deckAtSetup = this.game.gamedatas.cards.travellers.travellersDeck;
    const robbedTraveller =
      this.game.gamedatas.cards.travellers.travellerRobbed;
    if (robbedTraveller) {
      deckAtSetup.push(robbedTraveller);
    }
    this.travellers[TRAVELLERS_DECK] = new TravellersRow({
      containerId: 'travellers_info_panel',
      id: TRAVELLERS_DECK,
      title: _('Deck'),
      game: this.game,
      cardsAtSetup: deckAtSetup,
    });
    this.travellers[TRAVELLERS_DISCARD] = new TravellersRow({
      containerId: 'travellers_info_panel',
      id: TRAVELLERS_DISCARD,
      title: _('Discard Pile'),
      game: this.game,
      cardsAtSetup: this.game.gamedatas.cards.travellers.travellersDiscard,
    });
    this.travellers[TRAVELLERS_VICTIMS_PILE] = new TravellersRow({
      containerId: 'travellers_info_panel',
      id: TRAVELLERS_VICTIMS_PILE,
      title: _('Victims Pile'),
      game: this.game,
      cardsAtSetup: this.game.gamedatas.cards.travellers.travellersVictimsPile,
    });
    this.travellers[TRAVELLERS_POOL] = new TravellersRow({
      containerId: 'travellers_info_panel',
      id: TRAVELLERS_POOL,
      title: _('Out of play'),
      game: this.game,
      cardsAtSetup: this.game.gamedatas.cards.travellers.travellersPool,
    });
    // [TRAVELLERS_DECK].forEach((location) => {
    //   this.travellers[location] = new Trave
    // })
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
