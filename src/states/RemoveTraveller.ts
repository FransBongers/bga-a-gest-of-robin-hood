class RemoveTravellerState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringRemoveTravellerStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringRemoveTravellerStateArgs) {
    debug('Entering RemoveTravellerState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving RemoveTravellerState');
  }

  setDescription(activePlayerId: number) {}

  //  .####.##....##.########.########.########..########....###.....######..########
  //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
  //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
  //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
  //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
  //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
  //  .####.##....##....##....########.##.....##.##.......##.....##..######..########

  // ..######..########.########.########...######.
  // .##....##....##....##.......##.....##.##....##
  // .##..........##....##.......##.....##.##......
  // ..######.....##....######...########...######.
  // .......##....##....##.......##..............##
  // .##....##....##....##.......##........##....##
  // ..######.....##....########.##.........######.

  private updateInterfaceInitialStep() {
    this.game.clearPossible();

    this.updatePageTitle();

    const camps: GestForce[] = [];
    this.args.from.forEach((location) => {
      this.game.addPrimaryActionButton({
        id: `${location}_btn`,
        text: this.getLocationName({ location }),
        callback: () => this.updateInterfaceConfirm({ location }),
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceConfirm({ location }: { location: string }) {
    this.game.clearPossible();

    this.updatePageTitleConfirm({ location });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actRemoveTraveller',
        args: {
          from: location,
        },
      });
    };

    if (
      this.game.settings.get({
        id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
      }) === PREF_ENABLED
    ) {
      callback();
    } else {
      this.game.addConfirmButton({
        callback,
      });
    }

    this.game.addCancelButton();
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private updatePageTitle() {
    if (this.args.cardType === MONK) {
      this.game.clientUpdatePageTitle({
        text: _('${you} must choose where to remove a Monk from'),
        args: {
          you: '${you}',
        },
      });
    }
  }

  private updatePageTitleConfirm({ location }: { location: string }) {
    if (this.args.cardType === MONK) {
      this.game.clientUpdatePageTitle({
        text: _('Remove a Monk from the ${locationName}'),
        args: {
          locationName: this.getLocationName({ location }),
        },
      });
    }
  }

  private getLocationName({ location }) {
    switch (location) {
      case TRAVELLERS_DECK:
        return _('Travellers Deck');
      case TRAVELLERS_DISCARD:
        return _('Discard pile');
      default:
        return '';
    }
  }

  //  ..######..##.......####..######..##....##
  //  .##....##.##........##..##....##.##...##.
  //  .##.......##........##..##.......##..##..
  //  .##.......##........##..##.......#####...
  //  .##.......##........##..##.......##..##..
  //  .##....##.##........##..##....##.##...##.
  //  ..######..########.####..######..##....##

  // .##.....##....###....##....##.########..##.......########..######.
  // .##.....##...##.##...###...##.##.....##.##.......##.......##....##
  // .##.....##..##...##..####..##.##.....##.##.......##.......##......
  // .#########.##.....##.##.##.##.##.....##.##.......######....######.
  // .##.....##.#########.##..####.##.....##.##.......##.............##
  // .##.....##.##.....##.##...###.##.....##.##.......##.......##....##
  // .##.....##.##.....##.##....##.########..########.########..######.
}
