class EventReplaceHenchmenState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringEventReplaceHenchmenStateArgs;
  // private selectedForcesIds: string[] = [];
  private selectedForces: GestForce[] = [];
  private selectableForces: GestForce[] = [];
  private showSelected: GestForce[] = [];
  private placeRobinHood: boolean = false;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringEventReplaceHenchmenStateArgs) {
    debug('Entering EventReplaceHenchmenState');
    this.args = args;
    this.selectedForces = [];
    this.selectableForces = [];
    this.showSelected = [];
    this.placeRobinHood = false;
    this.selectableForces = this.args._private.forces;
    this.showSelected = this.args._private.showSelected || [];

    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving EventReplaceHenchmenState');
  }

  setDescription(
    activePlayerId: number,
    args: OnEnteringEventReplaceHenchmenStateArgs
  ) {}

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
    if (this.selectedForces.length === this.args._private.max) {
      this.updateInterfacePlaceRobinHood();
      return;
    }
    this.game.clearPossible();

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
      callback: () => this.updateInterfacePlaceRobinHood(),
      extraClasses:
        this.selectedForces.length < this.args._private.min ? DISABLED : '',
    });

    if (this.selectedForces.length > 0) {
      this.game.addCancelButton();
    } else {
      this.game.addPassButton({
        optionalAction: this.args.optionalAction,
      });
      this.game.addUndoButtons(this.args);
    }
  }

  private updateInterfacePlaceRobinHood() {
    if (!this.args._private.robinHoodInSupply) {
      this.updateInterfaceConfirm();
      return;
    }
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Place Robin Hood?'),
      args: {},
    });
    this.selectedForces.forEach(({ id }) =>
      this.game.setElementSelected({ id })
    );

    this.game.addPrimaryActionButton({
      id: 'yes_btn',
      text: _('Yes'),
      callback: () => {
        this.placeRobinHood = true;
        this.updateInterfaceConfirm();
      },
    });
    this.game.addPrimaryActionButton({
      id: 'no_btn',
      text: _('No'),
      callback: () => this.updateInterfaceConfirm(),
    });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Replace Henchmen with Merry Men?'),
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
        action: 'actEventReplaceHenchmen',
        args: {
          henchmenIds: this.getCallbackArgs(),
          placeRobinHood: this.placeRobinHood,
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
    this.game.clientUpdatePageTitle({
      text: _(
        '${you} may select Henchmen to replace with Merry Men (${count} remaining)'
      ),
      args: {
        you: '${you}',
        count: this.args._private.max - this.selectedForces.length,
      },
    });
  }

  private getCallbackArgs() {
    return this.selectedForces.map(({ id }) => id);
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
    this.updateInterfaceInitialStep();
    // this.updatePageTitle();
    // this.updateDoneButtonDisabled();
  }
}
