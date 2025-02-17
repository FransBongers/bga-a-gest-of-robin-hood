class ForceManager extends CardManager<GestForce> {
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

  setupDiv(force: GestForce, div: HTMLElement) {
    div.classList.add('gest_force');
    div.setAttribute('data-type', force.type);
  }

  setupFrontDiv(force: GestForce, div: HTMLElement) {
    div.classList.add('gest_force_side');

    // div.setAttribute('data-side', 'front');
    div.setAttribute('data-type', force.type);
    div.setAttribute('data-revealed', 'true');
    
    if (CARRIAGE_TYPES.includes(force.type)) {
      this.game.tooltipManager.addCarriageTooltip({nodeId: force.id, type: force.type});
    }
  }

  setupBackDiv(force: GestForce, div: HTMLElement) {
    div.classList.add('gest_force_side');
    // div.setAttribute('data-side', 'back');
    div.setAttribute('data-type', force.type);
    div.setAttribute('data-revealed', 'false');

    if (force.id.startsWith('fake')) {
      return;
    }
    // if (force.type === ROBIN_HOOD) {
    //   div.insertAdjacentHTML('beforeend', '<div>*</div>');
    // }
    if (CARRIAGE_TYPES.includes(force.type)) {
      this.game.tooltipManager.addCarriageTooltip({nodeId: force.id, type: force.type});
    } else if (force.type === CARRIAGE) {
      this.game.tooltipManager.addCarriageTooltip({nodeId: force.id, type: CARRIAGE});
    }
  }

  isCardVisible(force: GestForce) {
    return !force.hidden;
  }
}
