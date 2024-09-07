class InformationModal {
  protected game: AGestOfRobinHoodGame;

  private modal: Modal;

  private selectedTab: TabId = 'cardsInfo';
  private tabs: Record<TabId, { text: string }> = {
    cardsInfo: {
      text: _('Cards'),
    },
    orderJustice: {
      text: _('Order & Justice'),
    },
    robSummary: {
      text: _('Rob Summary'),
    },
    travellers: {
      text: _('Travellers'),
    },
    royalInspectionRound: {
      text: _('Royal Inspection'),
    },
  };

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

  private addButton({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    const configPanel = document.getElementById('info_panel_buttons');
    if (configPanel) {
      configPanel.insertAdjacentHTML('beforeend', tplInformationButton());
    }
  }

  private setupModal({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    this.modal = new Modal(`information_modal`, {
      class: 'information_modal',
      closeIcon: 'fa-times',
      // titleTpl:
      //   '<h2 id="popin_${id}_title" class="${class}_title">${title}</h2>',
      // title: _("Info"),
      contents: tplInformationModalContent({
        tabs: this.tabs,
        game: this.game,
      }),
      closeAction: 'hide',
      verticalAlign: 'flex-start',
      breakpoint: 740,
    });
  }

  // Setup functions
  setup({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    this.addButton({ gamedatas });
    this.setupModal({ gamedatas });
    this.informationModalContent();
    this.changeTab({ id: this.selectedTab });
    Object.keys(this.tabs).forEach((id: TabId) => {
      dojo.connect($(`information_modal_tab_${id}`), 'onclick', () =>
        this.changeTab({ id })
      );
    });

    dojo.connect($(`information_button`), 'onclick', () => this.modal.show());

    Object.values(this.game.gamedatas.staticData.cards).forEach((card) => {
      if (card.eventType !== null) {
        this.game.tooltipManager.addCardTooltip({
          nodeId: `cardsInfo_${card.id}`,
          cardId: card.id.split('_')[0],
        });
      }
    });

    gamedatas.cards.eventsDiscard.forEach((card) => {
      const node = document.getElementById(`cardsInfo_${card.id}`);
      if (node) {
        node.setAttribute('data-resolved', 'true');
      }
    })
  }

  // .##.....##.########..########.....###....########.########
  // .##.....##.##.....##.##.....##...##.##......##....##......
  // .##.....##.##.....##.##.....##..##...##.....##....##......
  // .##.....##.########..##.....##.##.....##....##....######..
  // .##.....##.##........##.....##.#########....##....##......
  // .##.....##.##........##.....##.##.....##....##....##......
  // ..#######..##........########..##.....##....##....########

  // ..######...#######..##....##.########.########.##....##.########
  // .##....##.##.....##.###...##....##....##.......###...##....##...
  // .##.......##.....##.####..##....##....##.......####..##....##...
  // .##.......##.....##.##.##.##....##....######...##.##.##....##...
  // .##.......##.....##.##..####....##....##.......##..####....##...
  // .##....##.##.....##.##...###....##....##.......##...###....##...
  // ..######...#######..##....##....##....########.##....##....##...

  private informationModalContent() {}

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private changeTab({ id }: { id: TabId }) {
    const currentTab = document.getElementById(
      `information_modal_tab_${this.selectedTab}`
    );
    const currentTabContent = document.getElementById(
      `gest_${this.selectedTab}`
    );
    currentTab.removeAttribute('data-state');
    if (currentTabContent) {
      currentTabContent.style.display = 'none';
    }

    this.selectedTab = id;
    const tab = document.getElementById(`information_modal_tab_${id}`);
    const tabContent = document.getElementById(`gest_${this.selectedTab}`);
    tab.setAttribute('data-state', 'selected');
    if (tabContent) {
      tabContent.style.display = '';
    }
  }
}
