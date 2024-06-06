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
  }

  setupFrontDiv(force: GestForce, div: HTMLElement) {
    div.classList.add('gest_force_side');

    // div.setAttribute('data-side', 'front');
    div.setAttribute('data-type', force.type);

    if ([TALLAGE_CARRIAGE, TRIBUTE_CARRIAGE, TRAP_CARRIAGE].includes(force.type)) {
      div.replaceChildren(force.type.substring(0, 3))
    }
    if (force.type === ROBIN_HOOD && !force.hidden) {
      console.log('add marker');
      div.replaceChildren('RH')
    }

    if (force.type === CAMP) {
      div.replaceChildren('C')
    }

    if (force.type === MERRY_MEN) {
      div.replaceChildren('M')
    }
  }

  setupBackDiv(force: GestForce, div: HTMLElement) {
    div.classList.add('gest_force_side');
    // div.setAttribute('data-side', 'back');
    div.setAttribute('data-type', force.type);
    if (force.id.startsWith('fake')) {
      return;
    }
    if (force.type === ROBIN_HOOD) {
      div.insertAdjacentHTML('beforeend', '<div>*</div>');
    }
    if ([TALLAGE_CARRIAGE, TRIBUTE_CARRIAGE, TRAP_CARRIAGE].includes(force.type)) {
      div.insertAdjacentHTML(
        'afterbegin',
        `<span>*${force.type.substring(0, 3)}</span>`
      );
    }
  }

  isCardVisible(force: GestForce) {
    if (force.type === ROBIN_HOOD) {
      console.log('robin hood back',force);
    }
    return !force.hidden;
  }
}
