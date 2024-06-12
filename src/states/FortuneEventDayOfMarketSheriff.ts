class FortuneEventDayOfMarketSheriffState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringFortuneEventDayOfMarketSheriffStateArgs;
  private selectedHenchmenIds: string[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringFortuneEventDayOfMarketSheriffStateArgs) {
    debug('Entering FortuneEventDayOfMarketSheriffState');
    this.args = args;
    this.selectedHenchmenIds = [];
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving FortuneEventDayOfMarketSheriffState');
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

    this.args.henchmen.forEach((henchman) => {
      this.game.setElementSelectable({
        id: henchman.id,
        callback: () => this.handleHenchmenClick({ henchman }),
      });
    });
    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm(),
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _(
        'Return ${count} Henchmen to Available to gain ${count} Shillings?'
      ),
      args: {
        count: this.selectedHenchmenIds.length,
      },
    });

    this.selectedHenchmenIds.forEach((henchmanId) =>
      this.game.setElementSelected({ id: henchmanId })
    );

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actFortuneEventDayOfMarketSheriff',
        args: {
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

  private updatePageTitle() {
    this.game.clientUpdatePageTitle({
      text: _('${you} may select Henchmen to remove (up to ${count} remaining)'),
      args: {
        you: '${you}',
        count: this.args.maxNumber - this.selectedHenchmenIds.length
      },
    });
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

  private handleHenchmenClick({ henchman }: { henchman: GestForce }) {
    if (this.selectedHenchmenIds.includes(henchman.id)) {
      this.game.removeSelectedFromElement({ id: henchman.id });
      this.selectedHenchmenIds = this.selectedHenchmenIds.filter(
        (id) => id !== henchman.id
      );
    } else {
      this.game.setElementSelected({ id: henchman.id });
      this.selectedHenchmenIds.push(henchman.id);
    }
    this.updatePageTitle();
    if (this.selectedHenchmenIds.length === this.args.maxNumber) {
      this.updateInterfaceConfirm();
    }
  }
}
