class SneakState extends MoveForcesState implements State {
  private args: OnEnteringSneakStateArgs;
  private selectedOption: SneakOption | null = null;
  private moves: Record<string, string[]>;

  constructor(game: AGestOfRobinHoodGame) {
    super(game);
  }

  onEnteringState(args: OnEnteringSneakStateArgs) {
    debug('Entering SneakState');
    this.args = args;
    this.selectedOption = null;
    this.moves = {};
    this.localMoves = {};

    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving SneakState');
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
      text: _('${you} must select a space to move Merry Men from'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args._private.options).forEach(([spacId, option]) => {
      this.game.addPrimaryActionButton({
        id: `${spacId}_btn`,
        text: _(option.space.name),
        callback: () => {
          this.selectedOption = option;
          this.udpateInterfaceSelectMerryMan();
        },
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });

    this.game.addUndoButtons(this.args);
  }

  private udpateInterfaceSelectMerryMan() {
    this.game.clearPossible();
    const movedMerryMen = Object.values(this.moves).flat();

    if (movedMerryMen.length === this.selectedOption.merryMen.length) {
      this.updateInterfaceConfirm();
      return;
    }

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Merry Man to move'),
      args: {
        you: '${you}',
      },
    });

    this.selectedOption.merryMen
      .filter((merryMan) => !movedMerryMen.includes(merryMan.id))
      .forEach((merryMan) => {
        this.game.setElementSelectable({
          id: merryMan.id,
          callback: () => this.updateInterfaceSelectAdjacentSpace({ merryMan }),
        });
      });

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm(),
      extraClasses: movedMerryMen.length === 0 ? DISABLED : '',
    });

    this.addCancelButton();
  }

  private updateInterfaceSelectAdjacentSpace({
    merryMan,
  }: {
    merryMan: GestForce;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select an adjacent space to move your Merry Man to'),
      args: {
        you: '${you}',
      },
    });

    this.game.setElementSelected({ id: merryMan.id });
    this.selectedOption.adjacentSpaces.forEach((space) => {
      this.game.addPrimaryActionButton({
        id: `${space.id}_btn`,
        text: _(space.name),
        callback: async () => {
          const fromSpaceId = merryMan.location;
          merryMan.location = space.id;
          this.addLocalMove({ force: merryMan, fromSpaceId });
          if (this.moves[space.id]) {
            this.moves[space.id].push(merryMan.id);
          } else {
            this.moves[space.id] = [merryMan.id];
          }
          // this.moves[merryMan.id] = space.id;
          await this.game.gameMap.forces[`${MERRY_MEN}_${space.id}`].addCard(
            merryMan
          );
          this.udpateInterfaceSelectMerryMan();
        },
      });
    });

    this.addCancelButton();
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Confirm moves?'),
      args: {},
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actSneak',
        args: {
          spaceId: this.selectedOption.space.id,
          moves: this.moves,
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

    this.addCancelButton();
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
