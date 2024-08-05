class EventAmbushLightState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringEventAmbushLightStateArgs;
  private selectedSpaceId: string = '';
  private merryMenIds: string[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    // super(game);
    this.game = game;
  }

  onEnteringState(args: OnEnteringEventAmbushLightStateArgs) {
    debug('Entering EventAmbushLightState');
    this.args = args;
    this.selectedSpaceId = '';
    this.merryMenIds = [];
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving EventAmbushLightState');
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
    if (this.args._private.spaceIds.length === 1) {
      this.selectedSpaceId = this.args._private.spaceIds[0];
      this.updateInterfaceSelectMerryMen();
      return;
    }

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a space with a Carriage'),
      args: {
        you: '${you}',
      },
    });

    this.args._private.spaceIds.forEach((spaceId) => {
      this.game.setSpaceSelectable({
        id: spaceId,
        callback: () => {
          this.selectedSpaceId = spaceId;
          this.updateInterfaceSelectMerryMen();
        },
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectMerryMen() {
    if (this.merryMenIds.length === this.args._private.merryMen.length) {
      this.updateInterfaceConfirm();
      return;
    }
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: _('${you} may select Merry Men to move to ${spaceName}'),
      args: {
        spaceName: _(this.game.gamedatas.spaces[this.selectedSpaceId].name),
        you: '${you}',
      },
    });
    this.game.setSpaceSelected({ id: this.selectedSpaceId });

    this.args._private.merryMen.forEach((merryMan) => {
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: () => this.handleMerryManClick({ merryMan }),
      });
    });
    this.merryMenIds.forEach((id) => this.game.setElementSelected({ id }));

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm(),
    });

    if (
      this.args._private.spaceIds.length === 1 &&
      this.merryMenIds.length === 0
    ) {
      // First step was skipped so we show undo buttons here
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
      text: _('Move Merry Men to ${spaceName}?'),
      args: {
        spaceName: this.game.gamedatas.spaces[this.selectedSpaceId].name,
      },
    });
    this.game.setSpaceSelected({ id: this.selectedSpaceId });
    this.merryMenIds.forEach((id) => this.game.setElementSelected({ id }));

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actEventAmbushLight',
        args: {
          spaceId: this.selectedSpaceId,
          merryMenIds: this.merryMenIds,
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

  private handleMerryManClick({ merryMan }: { merryMan: GestForce }) {
    if (this.merryMenIds.includes(merryMan.id)) {
      this.merryMenIds = this.merryMenIds.filter((id) => id !== merryMan.id);
    } else {
      this.merryMenIds.push(merryMan.id);
    }
    this.updateInterfaceSelectMerryMen();
  }
}
