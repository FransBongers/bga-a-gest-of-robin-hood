class InfoPanel {
  protected game: AGestOfRobinHoodGame;

  // public travellers: {
  //   [TRAVELLERS_DECK]?: TravellersRow;
  //   [TRAVELLERS_DISCARD]?: TravellersRow;
  //   [TRAVELLERS_VICTIMS_PILE]?: TravellersRow;
  //   [TRAVELLERS_POOL]?: TravellersRow;
  // } = {};

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

  public updateBalladInfo({
    balladNumber,
    eventNumber,
  }: {
    balladNumber: number;
    eventNumber: number;
  }) {
    const node = document.getElementById('gest_ballad_info_ballad_number');
    if (!node) {
      return;
    }
    node.replaceChildren(this.getBalladName({ balladNumber }));

    const eventNode = document.getElementById('gest_ballad_info_event_number');
    if (!eventNode) {
      return;
    }

    let eventText = this.game.format_string_recursive(
      _(' Event ${eventNumber} / 7'),
      {
        eventNumber,
      }
    );
    if (eventNumber === 8 && balladNumber !== 0) {
      eventText = _('Royal Inspection Round');
    } else if (balladNumber === 0) {
      eventText = '';
    }

    eventNode.replaceChildren(eventText);
  }

  // TODO: move this to separate class?
  public setupPlotsAndDeedsInfo() {
    const cardArea = document.getElementById('gest_card_area');
    if ( this.game.getPlayerId() ===
    this.game.playerManager.getRobinHoodPlayerId()) {
      cardArea.insertAdjacentHTML('afterbegin', tplRobinHoodPlotsAndDeeds());  
    } else {
      cardArea.insertAdjacentHTML('beforeend', tplRobinHoodPlotsAndDeeds());
    }
    // cardArea.insertAdjacentHTML('afterbegin', tplRobinHoodPlotsAndDeeds());
    if ( this.game.getPlayerId() ===
    this.game.playerManager.getSheriffPlayerId()) {
      cardArea.insertAdjacentHTML('afterbegin', tplSheriffPlotsAndDeeds());
    } else {
      cardArea.insertAdjacentHTML('beforeend', tplSheriffPlotsAndDeeds());
    }
    
  }

  // Setup functions
  setup({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    const node = document.getElementById('player_boards');
    if (!node) {
      return;
    }
    node.insertAdjacentHTML('afterbegin', tplInfoPanel());
    
    this.updateBalladInfo(gamedatas.ballad);

    // this.travellers[TRAVELLERS_DECK] = new TravellersRow({
    //   containerId: 'gest_travellers_info',
    //   id: TRAVELLERS_DECK,
    //   title: _('Deck'),
    //   game: this.game,
    //   cardsAtSetup: this.game.gamedatas.cards.travellers.travellersDeck
    // });
    // this.travellers[TRAVELLERS_DISCARD] = new TravellersRow({
    //   containerId: 'gest_travellers_info',
    //   id: TRAVELLERS_DISCARD,
    //   title: _('Discard Pile'),
    //   game: this.game,
    //   cardsAtSetup: this.game.gamedatas.cards.travellers.travellersDiscard
    // });
    // this.travellers[TRAVELLERS_VICTIMS_PILE] = new TravellersRow({
    //   containerId: 'gest_travellers_info',
    //   id: TRAVELLERS_VICTIMS_PILE,
    //   title: _('Victims Pile'),
    //   game: this.game,
    //   cardsAtSetup: this.game.gamedatas.cards.travellers.travellersVictimsPile
    // });
    // this.travellers[TRAVELLERS_POOL] = new TravellersRow({
    //   containerId: 'gest_travellers_info',
    //   id: TRAVELLERS_POOL,
    //   title: _('Pool'),
    //   game: this.game,
    //   cardsAtSetup: this.game.gamedatas.cards.travellers.travellersPool
    // });
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

  private getBalladName({ balladNumber }: { balladNumber: number }) {
    switch (balladNumber) {
      case 0:
        return _('Setup');
      case 1:
        return _('1st Ballad');
      case 2:
        return _('2nd Ballad');
      case 3:
        return _('3rd Ballad');
      default:
        return '';
    }
  }
}
