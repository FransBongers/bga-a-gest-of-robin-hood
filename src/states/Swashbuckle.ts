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
    if (this.args._private.length === 1) {
      this.updateInterfaceSelectRobinHoodDestination(this.args._private[0]);
      return;
    }
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Merry Man'),
      args: {
        you: '${you}',
      },
    });

    this.args._private.forEach((option) => {
      this.game.setElementSelectable({
        id: option.merryMan.id,
        callback: () => this.updateInterfaceSelectRobinHoodDestination(option),
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectRobinHoodDestination({
    merryMan,
    merryMenInSpace,
    spaces,
    fromPrison,
  }: SwashbuckleOption) {
    this.game.clearPossible();

    let text = '';
    if (merryMan.type === ROBIN_HOOD) {
      text = fromPrison
        ? _('${you} must select Space to place Robin Hood in')
        : _('${you} must select Space to move Robin Hood to');
    } else {
      text = fromPrison
        ? _('${you} must select Space to place your Merry Man in')
        : _('${you} must select Space to move your Merry Man to');
    }

    this.game.setElementSelected({ id: merryMan.id });

    this.game.clientUpdatePageTitle({
      text,
      args: {
        you: '${you}',
      },
    });

    spaces.forEach((space) => {
      this.game.addPrimaryActionButton({
        id: `${space.id}_btn`,
        text: _(space.name),
        callback: () => {
          if (fromPrison) {
            this.updateInterfaceConfirm({
              spaceRobinHood: space,
              robinHood: merryMan,
              fromPrison,
            });
          } else if (merryMenInSpace.length > 0) {
            this.updateInterfaceSelectMerryMan({
              spaceRobinHood: space,
              robinHood: merryMan,
              merryMenInSpace,
              spaces,
              fromPrison,
            });
          } else {
            this.updateInterfaceConfirm({
              spaceRobinHood: space,
              robinHood: merryMan,
              fromPrison,
            });
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
    robinHood,
    merryMenInSpace,
    spaces,
    fromPrison,
  }: {
    spaceRobinHood: GestSpace;
    robinHood: GestForce;
    merryMenInSpace: GestForce[];
    spaces: GestSpace[];
    fromPrison: boolean;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} may select a Merry Man to move or skip'),
      args: {
        you: '${you}',
      },
    });
    this.game.setElementSelected({ id: robinHood.id });

    merryMenInSpace.forEach((merryMan) =>
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: () =>
          this.updateInterfaceSelectSpaceMerryMan({
            spaceRobinHood,
            merryManId: merryMan.id,
            robinHood,
            spaces,
            fromPrison,
          }),
      })
    );
    this.game.addSecondaryActionButton({
      id: 'skip_btn',
      text: _('Skip'),
      callback: () =>
        this.updateInterfaceConfirm({ spaceRobinHood, robinHood, fromPrison }),
    });
    this.game.addCancelButton();
  }

  private updateInterfaceSelectSpaceMerryMan({
    spaceRobinHood,
    merryManId,
    spaces,
    robinHood,
    fromPrison,
  }: {
    spaceRobinHood: GestSpace;
    merryManId: string;
    robinHood: GestForce;
    spaces: GestSpace[];
    fromPrison: boolean;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Space to move the Merry Man to'),
      args: {
        you: '${you}',
      },
    });
    this.game.setElementSelected({ id: merryManId });

    spaces.forEach((space) => {
      this.game.addPrimaryActionButton({
        id: `${space.id}_btn`,
        text: _(space.name),
        callback: () =>
          this.updateInterfaceConfirm({
            spaceRobinHood,
            merryManId,
            merryManSpace: space,
            robinHood,
            fromPrison,
          }),
      });
    });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    fromPrison,
    spaceRobinHood,
    merryManId,
    merryManSpace,
    robinHood,
  }: {
    fromPrison: boolean;
    robinHood: GestForce;
    spaceRobinHood: GestSpace;
    merryManId?: string;
    merryManSpace?: GestSpace;
  }) {
    this.game.clearPossible();

    let text =
      robinHood.type === ROBIN_HOOD
        ? _(
            'Move Robin Hood to ${robinHoodspaceName} and the Merry Man to ${merryManSpaceName}?'
          )
        : _(
            'Move one Merry Man to ${robinHoodspaceName} and your other Merry Man to ${merryManSpaceName}?'
          );

    if (fromPrison && robinHood.type === ROBIN_HOOD) {
      text = _('Place Robin Hood Revealed in ${robinHoodspaceName}?');
    } else if (fromPrison) {
      text = _('Place your Merry Man Revealed in ${robinHoodspaceName}?');
    } else if (!merryManId && robinHood.type === ROBIN_HOOD) {
      text = _('Move Robin Hood to ${robinHoodspaceName}?');
    } else if (!merryManId) {
      text = _('Move your Merry Man to ${robinHoodspaceName}?');
    }

    this.game.setElementSelected({ id: robinHood.id });
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
          robinHoodId: robinHood.id,
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
