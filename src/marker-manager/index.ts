class MarkerManager extends CardManager<GestMarker> {
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

  setupDiv(token: GestMarker, div: HTMLElement) {
    div.classList.add('gest_marker');
  }

  setupFrontDiv(token: GestMarker, div: HTMLElement) {
    div.classList.add('gest_marker_side');
    div.setAttribute('data-side', 'front');
    div.setAttribute('data-type', token.type);
  }

  setupBackDiv(token: GestMarker, div: HTMLElement) {
    div.classList.add('gest_marker_side');
    div.setAttribute('data-side', 'back');
    div.setAttribute('data-type', token.type);
  }

  isCardVisible(token: GestMarker) {
    return token.side === 'front';
  }
}
