class DonateState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringDonateStateArgs;
  private selectedParishes: GestSpace[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringDonateStateArgs) {
    debug('Entering DonateState');
    this.selectedParishes = [];
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving DonateState');
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
      text: _('${you} must select Parishes to Donate to'),
      args: {
        you: '${you}',
      },
    });

    this.args.spaces
      .filter(
        (space) =>
          !this.selectedParishes.some(
            (selectedSpace) => selectedSpace.id === space.id
          )
      )
      .forEach((space) => {
        this.game.addPrimaryActionButton({
          id: `${space.id}_btn`,
          text: _(space.name),
          callback: () => {
            this.selectedParishes.push(space);
            if (this.selectedParishes.length === this.args.max) {
              this.updateInterfaceConfirm();
            } else {
              this.updateInterfaceInitialStep();
            }
          },
        });
      });
    if (
      this.selectedParishes.length > 0 &&
      this.selectedParishes.length < this.args.max
    ) {
      this.game.addPrimaryActionButton({
        id: 'done_btn',
        text: _('Done'),
        callback: () => this.updateInterfaceConfirm(),
      });
    }

    if (this.selectedParishes.length === 0) {
      this.game.addPassButton({
        optionalAction: this.args.optionalAction,
      });
      this.game.addUndoButtons(this.args);
    } else {
      this.game.addCancelButton();
    }
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text:
        this.selectedParishes.length === 1
          ? _('Donate in ${spaceName}?')
          : _('Donate in ${spaceName} and ${spaceName2}?'),
      args: {
        spaceName: _(this.selectedParishes[0].name),
        spaceName2: _(this.selectedParishes[1]?.name),
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actDonate',
        args: {
          selectedSpaceIds: this.selectedParishes.map((space) => space.id),
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

  // private handleSpaceClick({ henchman }: { henchman: GestForce }) {
  //   if (this.selectedHenchmenIds.includes(henchman.id)) {
  //     this.game.removeSelectedFromElement({ id: henchman.id });
  //     this.selectedHenchmenIds = this.selectedHenchmenIds.filter(
  //       (id) => id !== henchman.id
  //     );
  //   } else {
  //     this.game.setElementSelected({ id: henchman.id });
  //     this.selectedHenchmenIds.push(henchman.id);
  //   }
  // }
}
