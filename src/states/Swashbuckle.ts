class SwashbuckleState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringSwashbuckleStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringSwashbuckleStateArgs) {
    debug('Entering SwashbuckleState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving SwashbuckleState');
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
      text: this.args._private.robinHoodInPrison
        ? _('${you} must select Space to place Robin Hood in')
        : _('${you} must select Space to move Robin Hood to'),
      args: {
        you: '${you}',
      },
    });

    this.args._private.spaces.forEach((space) => {
      this.game.addPrimaryActionButton({
        id: `${space.id}_btn`,
        text: _(space.name),
        callback: () => {
          if (this.args._private.robinHoodInPrison) {
            this.updateInterfaceConfirm({ spaceRobinHood: space });
          } else if (this.args._private.merryMen.length > 0) {
            this.updateInterfaceSelectMerryMan({ spaceRobinHood: space });
          } else {
            this.updateInterfaceConfirm({ spaceRobinHood: space });
          }
        },
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectMerryMan({
    spaceRobinHood,
  }: {
    spaceRobinHood: GestSpace;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} may select a Merry Man to move or skip'),
      args: {
        you: '${you}',
      },
    });

    this.args._private.merryMen.forEach((merryMan) =>
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: () =>
          this.updateInterfaceSelectSpaceMerryMan({
            spaceRobinHood,
            merryManId: merryMan.id,
          }),
      })
    );
    this.game.addSecondaryActionButton({
      id: 'skip_btn',
      text: _('Skip'),
      callback: () => this.updateInterfaceConfirm({ spaceRobinHood }),
    });
    this.game.addCancelButton();
  }

  private updateInterfaceSelectSpaceMerryMan({
    spaceRobinHood,
    merryManId,
  }: {
    spaceRobinHood: GestSpace;
    merryManId: string;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Space to move the Merry Man to'),
      args: {
        you: '${you}',
      },
    });
    this.game.setElementSelected({ id: merryManId });

    this.args._private.spaces.forEach((space) => {
      this.game.addPrimaryActionButton({
        id: `${space.id}_btn`,
        text: _(space.name),
        callback: () =>
          this.updateInterfaceConfirm({
            spaceRobinHood,
            merryManId,
            merryManSpace: space,
          }),
      });
    });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    spaceRobinHood,
    merryManId,
    merryManSpace,
  }: {
    spaceRobinHood: GestSpace;
    merryManId?: string;
    merryManSpace?: GestSpace;
  }) {
    this.game.clearPossible();

    let text = _(
      'Move Robin Hood to ${robinHoodspaceName} and the Merry Man to ${merryManSpaceName}?'
    );

    if (this.args._private.robinHoodInPrison) {
      text = _('Place Robin Hood Revealed in ${spaceName}?');
    } else if (!merryManId) {
      text = _('Move Robin Hood to ${robinHoodspaceName}?');
    }

    this.game.setElementSelected({ id: ROBIN_HOOD });
    if (merryManId) {
      this.game.setElementSelected({ id: merryManId });
    }

    this.game.clientUpdatePageTitle({
      text,
      args: {
        robinHoodspaceName: _(spaceRobinHood.name),
        merryManSpaceName: merryManSpace ? _(merryManSpace.name) : '',
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actSwashbuckle',
        args: {
          robinHoodSpaceId: spaceRobinHood.id,
          merryManSpaceId: merryManSpace?.id,
          merryManId,
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
