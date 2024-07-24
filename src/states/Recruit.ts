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
      this.game.addSecondaryActionButton({
        id: `${option}_btn`,
        text: this.game.format_string_recursive(
          this.getOptionName({ option }),
          {
            tkn_merryMan_1: `${HIDDEN}:${MERRY_MEN}`,
            tkn_merryMan_2: `${HIDDEN}:${MERRY_MEN}`,
            tkn_merryMan_revealed: `${REVEALED}:${MERRY_MEN}`,
            tkn_camp: `${
              FOREST_SPACES.includes(space.id) ? REVEALED : HIDDEN
            }:${CAMP}`,
          }
        ),
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
        merryMan: merryMen[0],
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
            merryMan,
          });
        },
      });
    });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    space,
    recruitOption,
    merryMan,
    recruitRobinHood,
  }: {
    space: GestSpace;
    recruitOption: string;
    merryMan?: GestForce;
    recruitRobinHood?: boolean;
  }) {
    this.game.clearPossible();
    if (merryMan) {
      this.game.setElementSelected({ id: merryMan.id });
    }

    let text = _(
      'Pay 1 ${tkn_shilling} to place ${merryMenLog} in ${spaceName}?'
    );
    if (recruitOption === REPLACE_MERRY_MAN_WITH_CAMP) {
      text = _(
        'Pay 1 ${tkn_shilling} to replace ${tkn_merryMan} in ${spaceName} with ${tkn_camp}?'
      );
    } else if (recruitOption === FLIP_ALL_MERRY_MAN_TO_HIDDEN) {
      text = _(
        'Pay 1 ${tkn_shilling} to flip all ${tkn_merryMan_revealed} in ${spaceName} to ${tkn_merryMan_hidden}?'
      );
    }

    const args = {
      tkn_shilling: _('Shilling'),
      spaceName: _(space.name),
    };
    if (recruitOption === PLACE_MERRY_MAN) {
      args['merryMenLog'] = {
        log: '${tkn_merryMan_1}',
        args: {
          tkn_merryMan_1: `${HIDDEN}:${MERRY_MEN}`,
        },
      };
    } else if (recruitOption === PLACE_TWO_MERRY_MEN) {
      args['merryMenLog'] = {
        log: '${tkn_merryMan_1}${tkn_merryMan_2}',
        args: {
          tkn_merryMan_1: `${HIDDEN}:${MERRY_MEN}`,
          tkn_merryMan_2: `${HIDDEN}:${MERRY_MEN}`,
        },
      };
    } else if (recruitOption === REPLACE_MERRY_MAN_WITH_CAMP) {
      args['tkn_camp'] = `${
        FOREST_SPACES.includes(space.id) ? REVEALED : HIDDEN
      }:${CAMP}`;
      args['tkn_merryMan'] = `${
        merryMan?.hidden ? HIDDEN : REVEALED
      }:${MERRY_MEN}`;
    } else if (recruitOption === FLIP_ALL_MERRY_MAN_TO_HIDDEN) {
      args['tkn_merryMan_revealed'] = `${REVEALED}:${MERRY_MEN}`;
      args['tkn_merryMan_hidden'] = `${HIDDEN}:${MERRY_MEN}`;
    }

    this.game.clientUpdatePageTitle({
      // text: _('${recruitOption} in ${spaceName}?'),
      text,
      args,
    });

    // this.game.clientUpdatePageTitle({
    //   // text: _('${recruitOption} in ${spaceName}?'),
    //   text,
    //   args: {
    //     merryMenLog: {
    //       recruitOption ===
    //     },
    //     recruitOption: {
    //       log: this.getOptionName({ option: recruitOption }),
    //       args: {
    //         tkn_merryMan_1: `${HIDDEN}:${MERRY_MEN}`,
    //         tkn_merryMan_2: `${HIDDEN}:${MERRY_MEN}`,
    //         tkn_merryMan_revealed: `${REVEALED}:${MERRY_MEN}`,
    //         tkn_camp: `${
    //           FOREST_SPACES.includes(space.id) ? REVEALED : HIDDEN
    //         }:${CAMP}`,
    //       },
    //     },
    //     spaceName: _(space.name),
    //   },
    // });
    this.game.setSpaceSelected({ id: space.id });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actRecruit',
        args: {
          spaceId: space.id,
          recruitOption,
          merryManId: merryMan?.id,
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
        return _('Place ${tkn_merryMan_1}');
      case PLACE_TWO_MERRY_MEN:
        return _('Place ${tkn_merryMan_1}${tkn_merryMan_2}');
      case REPLACE_MERRY_MAN_WITH_CAMP:
        return _(
          'Replace ${tkn_merryMan_1} or ${tkn_merryMan_revealed} with ${tkn_camp}'
        );
      case FLIP_ALL_MERRY_MAN_TO_HIDDEN:
        return _('Flip all ${tkn_merryMan_revealed} to ${tkn_merryMan_1}');
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
