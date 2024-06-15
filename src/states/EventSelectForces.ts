class EventSelectForcesState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringEventSelectForcesStateArgs;
  private selectedForcesIds: string[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringEventSelectForcesStateArgs) {
    debug('Entering EventSelectForcesState');
    this.args = args;
    this.selectedForcesIds = [];
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

    this.args._private.forces.forEach((force) => {
      this.game.setElementSelectable({
        id: force.id,
        callback: () => this.handleForceClick({ force }),
      });
    });
    this.selectedForcesIds.forEach((id) =>
      this.game.setElementSelected({ id })
    );

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm(),
      extraClasses:
        this.selectedForcesIds.length < this.args._private.min ? DISABLED : '',
    });

    if (this.selectedForcesIds.length > 0) {
      this.game.addCancelButton();
    } else {
      this.game.addPassButton({
        optionalAction: this.args.optionalAction,
      });
      this.game.addUndoButtons(this.args);
    }
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _(this.args.confirmText),
      args: {
        count: this.selectedForcesIds.length,
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actEventSelectForces',
        args: {
          selectedForcesIds: this.selectedForcesIds,
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
      text: _(this.args.title),
      args: {
        you: '${you}',
        count: this.args._private.max - this.selectedForcesIds.length,
      },
    });
  }

  private updateDoneButtonDisabled() {
    const button = document.getElementById('done_btn');
    if (!button) {
      return;
    }
    if (this.selectedForcesIds.length < this.args._private.min) {
      button.classList.add(DISABLED);
    } else {
      button.classList.remove(DISABLED);
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
    if (this.selectedForcesIds.includes(force.id)) {
      // this.game.removeSelectedFromElement({ id: force.id });
      this.selectedForcesIds = this.selectedForcesIds.filter(
        (id) => id !== force.id
      );
    } else {
      this.game.setElementSelected({ id: force.id });
      this.selectedForcesIds.push(force.id);
    }
    if (this.selectedForcesIds.length === this.args._private.max) {
      this.updateInterfaceConfirm();
    }
    this.updateInterfaceInitialStep();
    // this.updatePageTitle();
    // this.updateDoneButtonDisabled();
  }
}
