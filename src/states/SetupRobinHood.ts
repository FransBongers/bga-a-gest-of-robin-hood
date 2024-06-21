class SetupRobinHoodState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringSetupRobinHoodArgs;
  private robinHood: GestForce | null = null;
  private merryMen: GestForce[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringSetupRobinHoodArgs) {
    debug('Entering SetupRobinHoodState');
    this.args = args;
    this.robinHood = null;
    this.merryMen = [];
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving SetupRobinHoodState');
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
      text: _('${you} must select a Space to place Robin Hood'),
      args: {
        you: '${you}',
      },
    });

    this.addSpaceButtons();

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfacePlaceMerryMen() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Space to place a Merry Man'),
      args: {
        you: '${you}',
      },
    });

    this.addSpaceButtons();

    this.addCancelButton();
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Place Robin Hood and Merry Men?'),
      args: {},
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actSetupRobinHood',
        args: {
          robinHood: this.robinHood.location,
          merryMen: this.merryMen.map((force) => ({
            id: force.id,
            location: force.location,
          })),
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

  addCancelButton() {
    this.game.addCancelButton({
      callback: () => {
        if (this.robinHood) {
          this.game.forceManager.removeCard(this.robinHood);
        }
        this.merryMen.forEach((merryMan) =>
          this.game.forceManager.removeCard(merryMan)
        );
        this.game.onCancel();
      },
    });
  }

  addSpaceButtons() {
    [SHIRE_WOOD, SOUTHWELL_FOREST, REMSTON].forEach((spaceId) => {
      this.game.addPrimaryActionButton({
        id: `${spaceId}_select`,
        text: _(this.game.gamedatas.spaces[spaceId].name),
        callback: () => this.handleButtonClick(spaceId),
      });
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

  handleButtonClick(spaceId: string) {
    if (this.robinHood === null) {
      const robinHood = this.args._private.robinHood;
      robinHood.location = spaceId;
      this.game.gameMap.forces[`${MERRY_MEN}_${spaceId}`].addCard(robinHood);
      this.robinHood = robinHood;
    } else {
      const merryMan = this.args._private.merryMen.find(
        (force) =>
          !this.merryMen.some(
            (placedMerryMan) => placedMerryMan.id === force.id
          )
      );
      merryMan.location = spaceId;
      this.game.gameMap.forces[`${MERRY_MEN}_${spaceId}`].addCard(merryMan);
      this.merryMen.push(merryMan);
    }

    if (this.merryMen.length >= 3) {
      this.updateInterfaceConfirm();
    } else {
      this.updateInterfacePlaceMerryMen();
    }
  }
}
