class EventSelectForcesState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringEventSelectForcesStateArgs;
  // private selectedForcesIds: string[] = [];
  private selectedForces: GestForce[] = [];
  private selectableForces: GestForce[] = [];
  private showSelected: GestForce[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringEventSelectForcesStateArgs) {
    debug('Entering EventSelectForcesState');
    this.args = args;
    this.selectedForces = [];
    this.selectableForces = [];
    this.showSelected = [];

    if (this.args._private.type === 'private') {
      this.selectableForces = this.args._private.forces;
      this.showSelected = this.args._private.showSelected || [];
    } else if (this.args._private.type === 'public') {
      this.getSelectablePublicForces({ forces: this.args._private.forces });
      this.getShowSelectedPublicForces({
        forces: this.args._private.showSelected || [],
      });
    }
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving EventSelectForcesState');
  }

  setDescription(
    activePlayerId: number,
    args: OnEnteringEventSelectForcesStateArgs
  ) {
    if (args.titleOther) {
      this.game.clientUpdatePageTitle({
        text: _(args.titleOther),
        args: {
          actplayer: '${actplayer}',
        },
        nonActivePlayers: true,
      });
    }
  }

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

    // this.game.clientUpdatePageTitle({
    //   text: _(this.args.title),
    //   args: {
    //     you: '${you}',
    //   },
    // });

    this.updatePageTitle();

    this.selectableForces.forEach((force) => {
      this.game.setElementSelectable({
        id: force.id,
        callback: () => this.handleForceClick({ force }),
      });
    });
    this.selectedForces.forEach((force) =>
      this.game.setElementSelected({ id: force.id })
    );
    this.showSelected.forEach((force) =>
      this.game.setElementSelected({ id: force.id })
    );

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm(),
      extraClasses:
        this.selectedForces.length < this.args._private.min ? DISABLED : '',
    });

    if (this.selectedForces.length > 0) {
      this.game.addCancelButton();
    } else {
      this.game.addPassButton({
        optionalAction: this.args.optionalAction,
        text: this.args.passButtonText || undefined,
      });
      this.game.addUndoButtons(this.args);
    }
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _(this.args.confirmText),
      args: {
        count: this.selectedForces.length,
      },
    });

    this.selectedForces.forEach(({ id }) =>
      this.game.setElementSelected({ id })
    );
    this.showSelected.forEach((force) =>
      this.game.setElementSelected({ id: force.id })
    );

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actEventSelectForces',
        args: {
          selectedForces: this.getCallbackArgs(),
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

  private getSelectablePublicForces({ forces }: { forces: GestPublicForce[] }) {
    forces.forEach(({ type, hidden, spaceId }: GestPublicForce) => {
      const force = this.game.gameMap.getForcePublic({
        type,
        hidden,
        spaceId,
        exclude: this.selectableForces,
      });
      this.selectableForces.push(force);
    });
  }

  private getShowSelectedPublicForces({
    forces,
  }: {
    forces: GestPublicForce[];
  }) {
    forces.forEach(({ type, hidden, spaceId }: GestPublicForce) => {
      const force = this.game.gameMap.getForcePublic({
        type,
        hidden,
        spaceId,
        exclude: this.showSelected,
      });
      this.showSelected.push(force);
    });
  }

  private updatePageTitle() {
    this.game.clientUpdatePageTitle({
      text: _(this.args.title),
      args: {
        you: '${you}',
        count: this.args._private.max - this.selectedForces.length,
      },
    });
  }

  private getCallbackArgs() {
    if (this.args._private.type === 'private') {
      return this.selectedForces.map(({ id }) => id);
    } else {
      return this.selectedForces.map(({ type, hidden, location }) => ({
        type,
        hidden,
        spaceId: location,
      }));
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

  private handleForceClick({ force }: { force: GestForce }) {
    if (this.selectedForces.some(({ id }) => id === force.id)) {
      // this.game.removeSelectedFromElement({ id: force.id });
      this.selectedForces = this.selectedForces.filter(
        ({ id }) => id !== force.id
      );
    } else {
      // this.game.setElementSelected({ id: force.id });
      this.selectedForces.push(force);
    }
    if (this.selectedForces.length === this.args._private.max) {
      this.updateInterfaceConfirm();
      return;
    }
    this.updateInterfaceInitialStep();
    // this.updatePageTitle();
    // this.updateDoneButtonDisabled();
  }
}
