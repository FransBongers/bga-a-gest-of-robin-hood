class TravellerManager extends CardManager<GestTravellerCard> {
  constructor(public game: AGestOfRobinHoodGame) {
    super(game, {
      getId: (card) => `${card.id}`,
      setupDiv: (card, div) => this.setupDiv(card, div),
      setupFrontDiv: (card, div: HTMLElement) => this.setupFrontDiv(card, div),
      setupBackDiv: (card, div: HTMLElement) => this.setupBackDiv(card, div),
      isCardVisible: (card) => this.isCardVisible(card),
      animationManager: game.animationManager,
    });
  }

  clearInterface() {}

  setupDiv(token: GestTravellerCard, div: HTMLElement) {
    div.classList.add('gest_traveller_image_container');
  }

  setupFrontDiv(token: GestTravellerCard, div: HTMLElement) {
    div.classList.add('gest_traveller_image');
    div.setAttribute('data-image', this.getImageId(token));
    div.setAttribute('data-image', this.getImageId(token));
    this.game.tooltipManager.addTravellersTooltip(
      `${this.getId(token)}-front`,
      this.getImageId(token)
    );
  }

  setupBackDiv(token: GestTravellerCard, div: HTMLElement) {
    div.classList.add('gest_traveller_image');
    div.setAttribute('data-image', this.getImageId(token));
  }

  isCardVisible(token: GestTravellerCard) {
    return true;
  }

  getImageId(card: GestTravellerCard) {
    return card.id.split('_')[1];
  }
}
