class EventGreatEscapeLightState extends MoveForcesState implements State {
  private args: OnEnteringEventGreatEscapeLightStateArgs;
  private moves: Record<string, string[]>;

  constructor(game: AGestOfRobinHoodGame) {
    super(game);
  }

  onEnteringState(args: OnEnteringEventGreatEscapeLightStateArgs) {
    debug('Entering EventGreatEscapeLightState');
    this.args = args;
    // this.selectedOption = null;
    this.moves = {};
    this.localMoves = {};

    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving EventGreatEscapeLightState');
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
    const movedMerryMen = Object.values(this.moves).flat();

    if (movedMerryMen.length === this.args._private.merryMen.length) {
      this.updateInterfacePlaceRobinHood();
      return;
    }

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Merry Man to move'),
      args: {
        you: '${you}',
      },
    });

    this.args._private.merryMen
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
      text: _('${you} must select a space to move your Merry Man to'),
      args: {
        you: '${you}',
      },
    });

    this.game.setElementSelected({ id: merryMan.id });
    this.args._private.spaces.forEach((space) => {
      this.game.setSpaceSelectable({
        id: space.id,
        callback: async () => {
          const fromSpaceId = merryMan.location;
          merryMan.location = space.id;
          const fromHidden = merryMan.hidden;
          merryMan.hidden = false;
          this.addLocalMove({ force: merryMan, fromSpaceId, fromHidden });
          if (this.moves[space.id]) {
            this.moves[space.id].push(merryMan.id);
          } else {
            this.moves[space.id] = [merryMan.id];
          }
          await this.game.gameMap.forces[`${MERRY_MEN}_${space.id}`].addCard(
            merryMan
          );
          this.updateInterfaceInitialStep();
        },
      });
    });

    this.addCancelButton();
  }

  private updateInterfacePlaceRobinHood() {
    const robinHood = this.args._private.robinHood;
    if (!robinHood) {
      this.updateInterfaceConfirm();
      return;
    }
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text:
        robinHood.location === ROBIN_HOOD_SUPPLY
          ? _('${you} must select a space to place Robin Hood')
          : _('${you} must select a space to move Robin Hood to'),
      args: {
        you: '${you}',
      },
    });

    this.game.setElementSelected({ id: robinHood.id });
    this.args._private.spaces.forEach((space) => {
      this.game.setSpaceSelectable({
        id: space.id,
        callback: async () => {
          const fromSpaceId = robinHood.location;
          robinHood.location = space.id;
          const fromHidden = robinHood.hidden;
          robinHood.hidden = false;
          this.addLocalMove({ force: robinHood, fromSpaceId, fromHidden });
          if (this.moves[space.id]) {
            this.moves[space.id].push(robinHood.id);
          } else {
            this.moves[space.id] = [robinHood.id];
          }
          await this.game.gameMap.forces[`${MERRY_MEN}_${space.id}`].addCard(
            robinHood
          );
          this.updateInterfaceConfirm();
        },
      });
    });
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
        action: 'actEventGreatEscapeLight',
        args: {
          // spaceId: this.selectedOption.space.id,
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
