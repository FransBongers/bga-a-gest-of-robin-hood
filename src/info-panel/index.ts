class InfoPanel {
  protected game: AGestOfRobinHoodGame;

  private ballad: {
    balladNumber: number;
    eventNumber: number;
  };

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
    this.ballad = {
      balladNumber,
      eventNumber,
    };

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

  public updateFortuneEventRevealed(revealed: boolean) {
    const nodeId = 'gest_fortune_event_icon';
    const node = document.getElementById(nodeId);
    if (!node) {
      return;
    }
    // Do not show during setup
    if (this.ballad.balladNumber === 0) {
      node.style.display = 'none';
    } else {
      node.style.display = '';
    }
    this.game.tooltipManager.removeTooltip(nodeId);
    if (revealed) {
      node.classList.add(GEST_NONE);
      this.game.tooltipManager.addTextToolTip({
        nodeId,
        text: _('Fortune Event has been resolved this Ballad'),
      });
    } else {
      node.classList.remove(GEST_NONE);
      this.game.tooltipManager.addTextToolTip({
        nodeId,
        text: _('Fortune Event has not been resolved this Ballad'),
      });
    }
  }

  // TODO: move this to separate class?
  public setupPlotsAndDeedsInfo() {
    const cardArea = document.getElementById('gest_card_area');
    this.game.playerOrder.forEach((playerId) => {
      if (this.game.playerManager.getPlayer({ playerId }).isRobinHood()) {
        cardArea.insertAdjacentHTML('beforeend', tplRobinHoodPlotsAndDeeds());
      } else {
        cardArea.insertAdjacentHTML('beforeend', tplSheriffPlotsAndDeeds());
      }
    });

    // if ( this.game.getPlayerId() ===
    // this.game.playerManager.getRobinHoodPlayerId()) {

    // } else if ( this.game.getPlayerId() ===
    // this.game.playerManager.getSheriffPlayerId()) {
    //   cardArea.insertAdjacentHTML('beforeend', tplSheriffPlotsAndDeeds());
    //   cardArea.insertAdjacentHTML('beforeend', tplRobinHoodPlotsAndDeeds());
    // } else {

    // }
    // // cardArea.insertAdjacentHTML('afterbegin', tplRobinHoodPlotsAndDeeds());
    // if ( this.game.getPlayerId() ===
    // this.game.playerManager.getSheriffPlayerId()) {

    // } else {
    //   cardArea.insertAdjacentHTML('beforeend', tplSheriffPlotsAndDeeds());
    // }
  }

  // Setup functions
  setup({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    const node = document.getElementById('player_boards');
    if (!node) {
      return;
    }
    node.insertAdjacentHTML('afterbegin', tplInfoPanel());

    this.updateBalladInfo(gamedatas.ballad);

    const fortuneEvents = gamedatas.cards.eventsDiscard.filter(
      (card) =>
        this.game.getStaticCardData(card.id).eventType ===
        'fortuneEvent'
    );
    console.log('fortuneEvents', fortuneEvents.length >= this.ballad.balladNumber);
    this.updateFortuneEventRevealed(fortuneEvents.length >= this.ballad.balladNumber);
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
