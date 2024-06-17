class EventBoatsBridgesLightState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringEventBoatsBridgesLightStateArgs;
  private fromSpaceId: string;
  private selectedMerryMenIds: string[];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringEventBoatsBridgesLightStateArgs) {
    debug('Entering EventBoatsBridgesLightState');
    this.args = args;
    this.fromSpaceId = '';
    this.selectedMerryMenIds = [];
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving EventBoatsBridgesLightState');
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

    Object.entries(this.args._private).forEach(
      ([spaceId, { space, merryMen }]) => {
        this.game.addPrimaryActionButton({
          id: `${spaceId}_btn`,
          text: _(space.name),
          callback: () => {
            this.fromSpaceId = spaceId;
            this.updateInterfaceSelectMerryMen();
          },
        });
      }
    );

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectMerryMen() {
    if (
      this.selectedMerryMenIds.length ===
      this.args._private[this.fromSpaceId].merryMen.length
    ) {
      this.updateInterfaceSelectDestination();
      return;
    }
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select Merry Men to move'),
      args: {
        you: '${you}',
      },
    });

    this.args._private[this.fromSpaceId].merryMen.forEach((merryMan) => {
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: () => {
          if (this.selectedMerryMenIds.includes(merryMan.id)) {
            this.selectedMerryMenIds = this.selectedMerryMenIds.filter(
              (id) => id !== merryMan.id
            );
          } else {
            this.selectedMerryMenIds.push(merryMan.id);
          }
          this.updateInterfaceSelectMerryMen();
        },
      });
    });
    this.selectedMerryMenIds.forEach((id) =>
      this.game.setElementSelected({ id })
    );

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceSelectDestination(),
      extraClasses: this.selectedMerryMenIds.length === 0 ? DISABLED : '',
    });

    this.game.addCancelButton();
  }

  private updateInterfaceSelectDestination() {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: _('${you} must select a space to move your Merry Men to'),
      args: {
        you: '${you}',
      },
    });
    this.selectedMerryMenIds.forEach((id) =>
      this.game.setElementSelected({ id })
    );

    SPACES.filter(
      (id) => ![this.fromSpaceId, SHIRE_WOOD, OLLERTON_HILL].includes(id)
    ).forEach((spaceId) => {
      this.game.addPrimaryActionButton({
        id: `${spaceId}_btn`,
        text: _(this.game.gamedatas.spaces[spaceId].name),
        callback: () => this.updateInterfaceConfirm({ toSpaceId: spaceId }),
      });
    });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({ toSpaceId }: { toSpaceId: string }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Move Merry Men from ${spaceName} to ${spaceName2}?  '),
      args: {
        spaceName: _(this.game.gamedatas.spaces[this.fromSpaceId].name),
        spaceName2: _(this.game.gamedatas.spaces[toSpaceId].name),
      },
    });

    this.selectedMerryMenIds.forEach((id) =>
      this.game.setElementSelected({ id })
    );

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actEventBoatsBridgesLight',
        args: {
          merryMenIds: this.selectedMerryMenIds,
          fromSpaceId: this.fromSpaceId,
          toSpaceId,
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
