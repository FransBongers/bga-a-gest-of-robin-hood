class SetupRobinHoodState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringSetupRobinHoodArgs;
  private robinHoodLocation: string | null = null;
  private merryMenLocations: string[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringSetupRobinHoodArgs) {
    debug('Entering SetupRobinHoodState');
    this.args = args;
    this.robinHoodLocation = null;
    this.merryMenLocations = [];
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

    this.game.addCancelButton();
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
          robinHood: this.robinHoodLocation,
          merryMen: this.merryMenLocations,
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
    if (this.robinHoodLocation === null) {
      this.robinHoodLocation = spaceId;
    } else {
      this.merryMenLocations.push(spaceId);
    }

    if (this.merryMenLocations.length >= 3) {
      this.updateInterfaceConfirm();
    } else {
      this.updateInterfacePlaceMerryMen();
    }
  }
}
