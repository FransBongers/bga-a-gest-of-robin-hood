class RecruitState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringRecruitStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringRecruitStateArgs) {
    debug('Entering RecruitState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving RecruitState');
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
      text: _('${you} must select a space to Recruit in'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args._private.options).forEach(([spaceId, option]) => {
      this.game.setSpaceSelectable({
        id: spaceId,
        callback: () => this.updateInterfaceSelectOption(option),
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectOption({
    space,
    recruitOptions,
    merryMen,
  }: RecruitOption) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select what to Recruit'),
      args: {
        you: '${you}',
      },
    });
    this.game.setSpaceSelected({ id: space.id });

    recruitOptions.forEach((option) => {
      this.game.addPrimaryActionButton({
        id: `${option}_btn`,
        text: this.getOptionName({ option }),
        callback: () => {
          if (
            this.args._private.robinHoodInSupply &&
            (option === PLACE_MERRY_MAN || option === PLACE_TWO_MERRY_MEN)
          ) {
            this.updateInterfaceRecruitRobinHood({
              space,
              recruitOption: option,
            });
          } else if (option === REPLACE_MERRY_MAN_WITH_CAMP) {
            this.updateInterfaceSelectMerryMan({
              space,
              recruitOption: option,
              merryMen,
            });
          } else {
            this.updateInterfaceConfirm({ space, recruitOption: option });
          }
        },
      });
    });

    this.game.addCancelButton();
  }

  private updateInterfaceRecruitRobinHood({
    space,
    recruitOption,
  }: {
    space: GestSpace;
    recruitOption: string;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Recruit Robin Hood?'),
      args: {
        you: '${you}',
      },
    });

    this.game.addPrimaryActionButton({
      id: 'yes_btn',
      text: _('Yes'),
      callback: () =>
        this.updateInterfaceConfirm({
          space,
          recruitOption,
          recruitRobinHood: true,
        }),
    });
    this.game.addPrimaryActionButton({
      id: 'no_btn',
      text: _('No'),
      callback: () =>
        this.updateInterfaceConfirm({
          space,
          recruitOption,
          recruitRobinHood: false,
        }),
    });

    this.game.addCancelButton();
  }

  private updateInterfaceSelectMerryMan({
    space,
    recruitOption,
    merryMen,
  }: {
    space: GestSpace;
    recruitOption: string;
    merryMen: GestForce[];
  }) {
    if (merryMen.length === 1) {
      this.updateInterfaceConfirm({
        space,
        recruitOption,
        merryManId: merryMen[0].id,
      });
      return;
    }
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Merry Man'),
      args: {
        you: '${you}',
      },
    });
    this.game.setSpaceSelected({ id: space.id });

    merryMen.forEach((merryMan) => {
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: () => {
          this.updateInterfaceConfirm({
            space,
            recruitOption,
            merryManId: merryMan.id,
          });
        },
      });
    });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    space,
    recruitOption,
    merryManId,
    recruitRobinHood,
  }: {
    space: GestSpace;
    recruitOption: string;
    merryManId?: string;
    recruitRobinHood?: boolean;
  }) {
    this.game.clearPossible();
    if (merryManId) {
      this.game.setElementSelected({ id: merryManId });
    }

    this.game.clientUpdatePageTitle({
      text: _('${recruitOption} in ${spaceName}?'),
      args: {
        recruitOption: this.getOptionName({ option: recruitOption }),
        spaceName: _(space.name),
      },
    });
    this.game.setSpaceSelected({ id: space.id });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actRecruit',
        args: {
          spaceId: space.id,
          recruitOption,
          merryManId,
          recruitRobinHood,
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

  private getOptionName({ option }: { option: string }) {
    switch (option) {
      case PLACE_MERRY_MAN:
        return _('Place one Merry Man');
      case PLACE_TWO_MERRY_MEN:
        return _('Place two Merry Man');
      case REPLACE_MERRY_MAN_WITH_CAMP:
        return _('Replace one Merry Man with a Camp');
      case FLIP_ALL_MERRY_MAN_TO_HIDDEN:
        return _('Flip all Merry Men to hidden');
      default:
        return ';';
    }
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
}
