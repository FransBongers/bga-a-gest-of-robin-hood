class PlaceHenchmenState extends PlaceForcesState implements State {
  private args: OnEnteringPlaceHenchmenStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    super(game);
  }

  onEnteringState(args: OnEnteringPlaceHenchmenStateArgs) {
    debug('Entering PlaceHenchmenState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving PlaceHenchmenState');
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
      text: _('${you} must select a space to place Henchmen in'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args.spaces).forEach(([spaceId, space]) =>
      this.game.addPrimaryActionButton({
        id: `${space.id}_btn`,
        text: _(space.name),
        callback: () => this.updateInterfaceSelectNumberOfHenchmen({ space }),
      })
    );

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectNumberOfHenchmen({
    space,
  }: {
    space: GestSpace;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must choose how many Henchmen to place'),
      args: {
        you: '${you}',
      },
    });

    for (let i = 0; i <= this.args.maxNumber; i++) {
      this.game.addPrimaryActionButton({
        id: `${i}_btn`,
        text: `${i}`,
        callback: () => {
          this.updateInterfaceConfirm({ space, count: i });
        },
      });
    }

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    space,
    count,
  }: {
    space: GestSpace;
    count: number;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Place ${count} Henchmen in ${spaceName}?'),
      args: {
        spaceName: _(space.name),
        count,
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actPlaceHenchmen',
        args: {
          spaceId: space.id,
          count,
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
}
