class InfoPanel {
  protected game: AGestOfRobinHoodGame;
  private modal: Modal;
  private selectedTab: BalladModalTabId = 'ballad1';
  private tabs: Record<BalladModalTabId, { text: string }> = {
    ballad1: {
      text: _('1st Ballad'),
    },
    ballad2: {
      text: _('2nd Ballad'),
    },
    ballad3: {
      text: _('3rd Ballad'),
    },
  };

  private discard: GestCard[];

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
      eventText = _('Royal Inspection');
    } else if (balladNumber === 0) {
      eventText = '';
    }

    eventNode.replaceChildren(eventText);
  }

  private setupModal({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    this.modal = new Modal(`ballad_modal`, {
      class: 'ballad_modal',
      closeIcon: 'fa-times',
      // titleTpl:
      //   '<h2 id="popin_${id}_title" class="${class}_title">${title}</h2>',
      title: _('Played Cards'),
      contents: tplBalladModalContent({
        tabs: this.tabs,
        game: this.game,
        cards: this.discard,
      }),
      closeAction: 'hide',
      verticalAlign: 'flex-start',
      breakpoint: 740,
    });
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
        text: _('Fortune Event has not happened this Ballad'),
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
    this.discard = gamedatas.cards.eventsDiscard;
    const node = document.getElementById('player_boards');
    if (!node) {
      return;
    }
    node.insertAdjacentHTML('afterbegin', tplInfoPanel());

    this.setupHelpModeSwitch();

    this.updateBalladInfo(gamedatas.ballad);

    const tabId = `ballad${
      gamedatas.ballad.balladNumber || 1
    }` as BalladModalTabId;
    this.selectedTab = tabId;

    const fortuneEvents = gamedatas.cards.eventsDiscard.filter(
      (card) =>
        this.game.getStaticCardData(card.id).eventType === 'fortuneEvent'
    );

    this.updateFortuneEventRevealed(
      fortuneEvents.length >= this.ballad.balladNumber
    );

    this.setupModal({ gamedatas });

    this.changeTab({ id: this.selectedTab });
    Object.keys(this.tabs).forEach((id: BalladModalTabId) => {
      dojo.connect($(`ballad_modal_tab_${id}`), 'onclick', () =>
        this.changeTab({ id })
      );
    });

    dojo.connect($(`gest_ballad_info`), 'onclick', () => this.modal.show());
  }

  // Separate function because we need to call it after settings have been setup
  public setupAddCardTooltips() {
    this.discard.forEach((card) => {
      this.game.tooltipManager.addCardTooltip({
        nodeId: `balladInfo_${card.id}`,
        cardId: card.id.split('_')[0],
      });
    });
  }

  private setupHelpModeSwitch() {
    document
      .getElementById('info_panel_buttons')
      .insertAdjacentHTML('afterbegin', tplHelpModeSwitch());

    let checkBox = document.getElementById('help-mode-chk') as HTMLInputElement;
    dojo.connect(checkBox, 'onchange', () =>
      this.game.toggleHelpMode(checkBox.checked)
    );

    this.game.tooltipManager.addTextToolTip({
      nodeId: 'help-mode-switch',
      text: _('Toggle help/safe mode'),
      custom: false,
    });
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

  public updateModalContent(card: GestCard) {
    this.discard.push(card);

    if (this.game.getStaticCardData(card.id).eventType === 'royalInspection') {
      return;
    }

    const nodeId = document.getElementById(
      `gest_ballad${this.ballad.balladNumber}`
    );

    nodeId.insertAdjacentHTML(
      'beforeend',
      tplLogTokenCard(card.id.split('_')[0], `balladInfo_${card.id}`)
    );

    this.game.tooltipManager.addCardTooltip({
      nodeId: `balladInfo_${card.id}`,
      cardId: card.id.split('_')[0],
    });
  }

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

  private changeTab({ id }: { id: BalladModalTabId }) {
    const currentTab = document.getElementById(
      `ballad_modal_tab_${this.selectedTab}`
    );
    const currentTabContent = document.getElementById(
      `gest_${this.selectedTab}`
    );
    currentTab.removeAttribute('data-state');
    if (currentTabContent) {
      currentTabContent.style.display = 'none';
    }

    this.selectedTab = id;
    const tab = document.getElementById(`ballad_modal_tab_${id}`);
    const tabContent = document.getElementById(`gest_${this.selectedTab}`);
    tab.setAttribute('data-state', 'selected');
    if (tabContent) {
      tabContent.style.display = '';
    }
  }
}
