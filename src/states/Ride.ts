class RideState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringRideStateArgs;
  private selectedSpace: GestSpace | null = null;
  private selectedHenchmenIds: string[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringRideStateArgs) {
    debug('Entering RideState');
    this.selectedHenchmenIds = [];
    this.selectedSpace = null;
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving RideState');
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

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Parish to move Henchmen to'),
      args: {
        you: '${you}',
      },
    });

    this.args.spaces.forEach((space) => {
      this.game.addPrimaryActionButton({
        id: `${space.id}_btn`,
        text: _(space.name),
        callback: () => {
          this.selectedSpace = space;
          this.updateInterfaceSelectHenchmen();
        },
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectHenchmen() {
    if (
      this.selectedHenchmenIds.length === 4 ||
      this.selectedHenchmenIds.length === this.args.henchmen.length
    ) {
      this.updateInterfaceConfirm();
      return;
    } else if (this.args.henchmen.length === 1) {
      this.selectedHenchmenIds.push(this.args.henchmen[0].id);
      this.updateInterfaceConfirm();
      return;
    }
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select Henchmen to move to ${spaceName}'),
      args: {
        you: '${you}',
        spaceName: _(this.selectedSpace.name),
      },
    });

    this.args.henchmen.forEach((henchman) => {
      this.game.setElementSelectable({
        id: henchman.id,
        callback: () => this.handleHenchmenClick({ henchman }),
      });
    });
    this.selectedHenchmenIds.forEach((id) =>
      this.game.setElementSelected({ id })
    );

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm(),
      extraClasses: this.selectedHenchmenIds.length === 0 ? DISABLED : '',
    });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text:
        this.selectedHenchmenIds.length > 0
          ? _('Move ${count} Henchmen to ${spaceName} and Ride?')
          : _('Ride in ${spaceName}?'),
      args: {
        spaceName: _(this.selectedSpace.name),
        count: this.selectedHenchmenIds.length,
      },
    });

    this.selectedHenchmenIds.forEach((id) =>
      this.game.setElementSelected({ id })
    );

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actRide',
        args: {
          spaceId: this.selectedSpace.id,
          henchmenIds: this.selectedHenchmenIds,
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

  private handleHenchmenClick({ henchman }: { henchman: GestForce }) {
    if (this.selectedHenchmenIds.includes(henchman.id)) {
      // this.game.removeSelectedFromElement({ id: henchman.id });
      this.selectedHenchmenIds = this.selectedHenchmenIds.filter(
        (id) => id !== henchman.id
      );
    } else {
      // this.game.setElementSelected({ id: henchman.id });
      this.selectedHenchmenIds.push(henchman.id);
    }
    this.updateInterfaceSelectHenchmen();
    // if (this.selectedHenchmenIds.length === 4) {
    //   this.updateInterfaceConfirm();
    // }
  }
}
