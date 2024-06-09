class RoyalInspectionReturnMerryMenFromPrisonState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringRoyalInspectionReturnMerryMenFromPrisonStateArgs;
  private selectedMerryMenIds: string[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(
    args: OnEnteringRoyalInspectionReturnMerryMenFromPrisonStateArgs
  ) {
    debug('Entering RoyalInspectionReturnMerryMenFromPrisonState');
    this.args = args;
    this.selectedMerryMenIds = [];
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving RoyalInspectionReturnMerryMenFromPrisonState');
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

    this.args._private.merryMen.forEach((merryMan) => {
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: () => this.handleMerryManClick({ merryMan }),
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Return ${count} Merry Men to Available Forces?'),

      args: {
        count: this.selectedMerryMenIds.length,
      },
    });

    this.selectedMerryMenIds.forEach((id) =>
      this.game.setElementSelected({ id })
    );

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actRoyalInspectionReturnMerryMenFromPrison',
        args: {
          merryManIds: this.selectedMerryMenIds,
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

  private updatePageTitle() {
    this.game.clientUpdatePageTitle({
      text: _(
        '${you} must select Merry Men to return to Available Forces (${count} remaining)'
      ),
      args: {
        you: '${you}',
        count:
          this.args._private.numberToReturn - this.selectedMerryMenIds.length,
      },
    });
  }

  private handleMerryManClick({ merryMan }: { merryMan: GestForce }) {
    if (this.selectedMerryMenIds.includes(merryMan.id)) {
      this.game.removeSelectedFromElement({ id: merryMan.id });
      this.selectedMerryMenIds = this.selectedMerryMenIds.filter(
        (id) => id !== merryMan.id
      );
    } else {
      this.game.setElementSelected({ id: merryMan.id });
      this.selectedMerryMenIds.push(merryMan.id);
    }
    if (this.selectedMerryMenIds.length === this.args._private.numberToReturn) {
      this.updateInterfaceConfirm();
    }
  }
}
