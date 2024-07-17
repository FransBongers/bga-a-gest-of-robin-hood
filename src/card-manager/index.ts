class GestCardManager extends CardManager<GestCard> {
  constructor(public game: AGestOfRobinHoodGame) {
    super(game, {
      getId: (card) => card.id.split('_')[0],
      setupDiv: (card, div) => this.setupDiv(card, div),
      setupFrontDiv: (card, div: HTMLElement) => this.setupFrontDiv(card, div),
      setupBackDiv: (card, div: HTMLElement) => this.setupBackDiv(card, div),
      isCardVisible: (card) => this.isCardVisible(card),
      animationManager: game.animationManager,
    });
  }

  clearInterface() {}

  setupDiv(card: GestCard, div: HTMLElement) {
    div.style.height = 'calc(var(--gestCardScale) * 355px)';
    div.style.width = 'calc(var(--gestCardScale) * 206px)';

    div.style.position = 'relative';
    div.classList.add('gest_card');
  }

  setupFrontDiv(card: GestCard, div: HTMLElement) {
    div.classList.add('gest_card_side');

    div.style.height = 'calc(var(--gestCardScale) * 355px)';
    div.style.width = 'calc(var(--gestCardScale) * 206px)';
    div.setAttribute('data-card-id', card.id.split('_')[0]);

    const cardId = card.id.split('_')[0];
    this.game.tooltipManager.addCardTooltip({
      nodeId: cardId,
      cardId: cardId
    });
  }

  setupBackDiv(card: GestCard, div: HTMLElement) {
    div.classList.add('gest_card_side');

    div.style.height = 'calc(var(--gestCardScale) * 355px)';
    div.style.width = 'calc(var(--gestCardScale) * 206px)';
    const cardId = card.id.split('_')[0];
    div.setAttribute(
      'data-card-id',
      this.game.gamedatas.staticData.cards[cardId].type === 'eventCard'
        ? 'EventBack'
        : 'TravellerBack'
    );
  }

  isCardVisible(card: GestCard) {
    if (
      card.location.startsWith('eventsDeck') ||
      card.location.startsWith('travellersDeck')
    ) {
      return false;
    }
    return true;
  }

  updateDisplay(
    element: HTMLElement,
    cards: GestCard[],
    lastCard: GestCard,
    stock: ManualPositionStock<GestCard>
  ) {
    const node = stock.getCardElement(lastCard);
    if (!node) {
      return;
    }
    node.style.top = '0px';
    node.style.left = '0px';
    node.style.position = 'absolute';
  }
}
