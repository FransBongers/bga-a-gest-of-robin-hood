class TravellersRow {
  protected game: AGestOfRobinHoodGame;
  private rowId: string;
  private containerId: string;
  private counter: Counter;
  private stock: GestLineStock<GestTravellerCard>;


  constructor(config: TravellersRowConfig) {
    const { containerId, game } = config;
    this.rowId = `gest_info_${config.id}`;
    this.game = game;
    this.containerId = containerId;

    this.setup(config);
    
  }

  setup({id, title, cardsAtSetup}: TravellersRowConfig) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      return;
    }
    container.insertAdjacentHTML(
      "beforeend",
      tplTravellersRow({ id, title })
    );

    this.counter = new ebg.counter();
    this.counter.create(`gest_travellers_row_${id}_counter`);
    this.counter.setValue(cardsAtSetup.length);

    this.stock = new GestLineStock<GestTravellerCard>(
      this.game.travellerManager,
      document.getElementById(`gest_travellers_${id}`),
      {
        gap: '4px',
        center: false,
        sort: sortFunction('travellerOrder'),
      },
      (card) => this.onCardRemoved(card),
    )

    this.stock.addCards(cardsAtSetup);
    this.updateVisibility(cardsAtSetup.length);
  }

  public updateVisibility(count: number) {
    const node = document.getElementById(this.rowId);
    if (!node) {
      return;
    }
    if (count === 0) {
      node.classList.add(GEST_NONE)
    } else {
      node.classList.remove(GEST_NONE)
    }
  }

  public async addCard(card: GestTravellerCard) {
    this.counter.incValue(1);
    this.updateVisibility(1);
    await this.stock.addCard(card);
  }

  public async addCards(cards: GestTravellerCard[]) {
    this.counter.incValue(cards.length);
    this.updateVisibility(this.stock.getCards().length + cards.length);
    await this.stock.addCards(cards);
  }

  public async removeCard(card: GestTravellerCard) {
    await this.stock.removeCard(card);
  }

  private onCardRemoved(card: GestTravellerCard) {
    // console.log('onCardRemoved', this.onCardRemoved);
    if (this.stock.getCards().some((cardInStock) => cardInStock.id === card.id)) {
      this.counter.incValue(-1);
    }
    this.updateVisibility(this.counter.getValue());
  }

  // public setValue(value: number) {
  //   this.counter.setValue(value);
  //   const node = document.getElementById(this.iconCounterId);
  //   if (!node) {
  //     return;
  //   }
  //   this.checkNone({node, value});
    
  // }

  // public incValue(value: number) {
  //   this.counter.incValue(value);
  //   const node = document.getElementById(this.iconCounterId);
  //   if (!node) {
  //     return;
  //   }
  //   this.checkNone({node, value: this.counter.getValue()});
  // }

  // public getValue() {
  //   return this.counter.getValue();
  // }

  // private checkNone({node, value}: {node: HTMLElement; value: number;}) {
  //   if (value === 0) {
  //     node.classList.add(GEST_NONE)
  //   } else {
  //     node.classList.remove(GEST_NONE)
  //   }
  // }
}
