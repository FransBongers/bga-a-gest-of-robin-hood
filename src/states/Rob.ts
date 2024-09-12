type RobTarget =
  | 'traveller'
  | 'treasury'
  | 'HiddenCarriage'
  | 'TallageCarriage'
  | 'TrapCarriage'
  | 'TributeCarriage';

class RobState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringRobStateArgs;
  private selectedMerryMen: GestForce[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringRobStateArgs) {
    debug('Entering RobState');
    this.args = args;
    this.selectedMerryMen = [];
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving RobState');
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
      text: _('${you} must select a Space to Rob'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args._private.options).forEach(([spaceId, option]) =>
      this.game.setSpaceSelectable({
        id: spaceId,
        callback: () => this.updateInterfaceSelectTarget({ option }),
      })
    );

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectTarget({ option }: { option: RobOption }) {
    this.game.clearPossible();

    const targets = this.getTargets({ option });
    if (targets.length === 1) {
      this.updateInterfaceSelectMerryMen({
        space: option.space,
        target: targets[0],
        merryMen: option.merryMen,
      });
      return;
    }

    this.game.setSpaceSelected({ id: option.space.id });

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a target'),
      args: {
        you: '${you}',
      },
    });

    targets.forEach((target) => this.addTargetButton({ option, target }));

    this.game.addCancelButton();
  }

  private updateInterfaceSelectMerryMen({
    space,
    target,
    merryMen,
  }: {
    space: GestSpace;
    target: RobTargetId;
    merryMen: GestForce[];
  }) {
    this.game.clearPossible();

    if (merryMen.length === 1) {
      this.selectedMerryMen.push(merryMen[0]);
      this.updateInterfaceConfirm({
        space,
        target,
      });
      return;
    }
    this.game.setSpaceSelected({ id: space.id });

    this.game.clientUpdatePageTitle({
      text: _('${you} must select Merry Men to Rob with'),
      args: {
        you: '${you}',
      },
    });

    merryMen.forEach((merryMan) =>
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: () => {
          if (
            this.selectedMerryMen.some(
              (selectedMerryMan) => selectedMerryMan.id === merryMan.id
            )
          ) {
            this.selectedMerryMen = this.selectedMerryMen.filter(
              (selectedMerryMan) => selectedMerryMan.id !== merryMan.id
            );
          } else {
            this.selectedMerryMen.push(merryMan);
          }
          this.updateInterfaceSelectMerryMen({ space, target, merryMen });
        },
      })
    );
    this.selectedMerryMen.forEach(({ id }) =>
      this.game.setElementSelected({ id })
    );

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm({ space, target }),
      extraClasses: this.selectedMerryMen.length === 0 ? DISABLED : '',
    });
    if (this.selectedMerryMen.length < merryMen.length) {
      this.game.addSecondaryActionButton({
        id: 'select_all_btn',
        text: _('Select all'),
        callback: () => {
          this.selectedMerryMen = [...merryMen];
          this.updateInterfaceConfirm({ space, target });
        },
      });
    }

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    space,
    target,
  }: {
    space: GestSpace;
    target: RobTargetId;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Rob ${target} in ${spaceName} with ${merryMenLog}'),
      args: {
        spaceName: _(space.name),
        target: this.getTargetLog(target),
        // count: this.selectedMerryMenIds.length,
        merryMenLog: createForcesLog(this.selectedMerryMen),
      },
    });

    this.selectedMerryMen.forEach(({ id }) =>
      this.game.setElementSelected({ id })
    );

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actRob',
        args: {
          target,
          spaceId: space.id,
          merryMenIds: this.selectedMerryMen.map((merryMan) => merryMan.id),
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

  private addTargetButton({
    option,
    target,
  }: {
    target: RobTarget;
    option: RobOption;
  }) {
    if (CARRIAGE_TYPES.includes(target)) {
      this.game.addSecondaryActionButton({
        id: `${target}_btn`,
        text: this.game.format_string_recursive('${tkn_carriage}', {
          tkn_carriage: `${REVEALED}:${target}`,
        }),
        callback: () =>
          this.updateInterfaceSelectMerryMen({
            space: option.space,
            target: target,
            merryMen: option.merryMen,
          }),
      });
    } else if (target === HIDDEN_CARRIAGE) {
      this.game.addSecondaryActionButton({
        id: `${target}_btn`,
        text: this.game.format_string_recursive('${tkn_carriage}', {
          tkn_carriage: `${HIDDEN}:${CARRIAGE}`,
        }),
        callback: () =>
          this.updateInterfaceSelectMerryMen({
            space: option.space,
            target: target,
            merryMen: option.merryMen,
          }),
      });
    } else if (target === 'traveller') {
      this.game.addSecondaryActionButton({
        id: `${target}_btn`,
        text: this.game.format_string_recursive('${tkn_travellerBack}', {
          tkn_travellerBack: 'TravellerBack',
        }),
        callback: () =>
          this.updateInterfaceSelectMerryMen({
            space: option.space,
            target: target,
            merryMen: option.merryMen,
          }),
      });
    } else {
      this.game.addPrimaryActionButton({
        id: `${target}_btn`,
        text: _("Sheriff's Treasury"),
        callback: () =>
          this.updateInterfaceSelectMerryMen({
            space: option.space,
            target: target,
            merryMen: option.merryMen,
          }),
      });
    }
  }

  private getTargets({ option }: { option: RobOption }): RobTargetId[] {
    const targets: RobTargetId[] = [];

    if (option.treasury) {
      targets.push('treasury');
    }
    if (option.traveller) {
      targets.push('traveller');
    }
    Object.entries(option.carriages).forEach(([type, count]) => {
      if (count > 0) {
        targets.push(type as RobTargetId);
      }
    });

    return targets;
  }

  private getTargetLog(target: RobTarget) {
    switch (target) {
      case 'treasury':
        return _("the Sheriff's Treasury");
      case 'traveller':
        return this.game.format_string_recursive('${tkn_travellerBack}', {
          tkn_travellerBack: 'TravellerBack',
        });
      case 'HiddenCarriage':
        return this.game.format_string_recursive('${tkn_carriage}', {
          tkn_carriage: `${HIDDEN}:${CARRIAGE}`,
        });
      case 'TallageCarriage':
      case 'TrapCarriage':
      case 'TributeCarriage':
        return this.game.format_string_recursive('${tkn_carriage}', {
          tkn_carriage: `${REVEALED}:${target}`,
        });
    }
  }

  // private getTargetName({ target }: { target: RobTarget }): string {
  //   switch (target) {
  //     case 'treasury':
  //       return _("the Sheriff's Treasury");
  //     case 'traveller':
  //       return _('a random Traveller');
  //     case 'HiddenCarriage':
  //     case 'TallageCarriage':
  //     case 'TrapCarriage':
  //     case 'TributeCarriage':
  //       return _(target);
  //   }
  // }

  // .##.....##....###....##....##.########..##.......########..######.
  // .##.....##...##.##...###...##.##.....##.##.......##.......##....##
  // .##.....##..##...##..####..##.##.....##.##.......##.......##......
  // .#########.##.....##.##.##.##.##.....##.##.......######....######.
  // .##.....##.#########.##..####.##.....##.##.......##.............##
  // .##.....##.##.....##.##...###.##.....##.##.......##.......##....##
  // .##.....##.##.....##.##....##.########..########.########..######.

  // private handleMerryManClick({ merryMan }: { merryMan: GestForce }) {
  //   if (this.selectedMerryMen.some((selectedMerryMan) => selectedMerryMan.id === merryMan.id)) {
  //     this.game.removeSelectedFromElement({ id: merryMan.id });
  //     this.selectedMerryMenIds = this.selectedMerryMenIds.filter(
  //       (id) => id !== merryMan.id
  //     );
  //     if (this.selectedMerryMenIds.length === 0) {
  //       document.getElementById('done_btn').classList.add(DISABLED);
  //     }
  //   } else {
  //     this.game.setElementSelected({ id: merryMan.id });
  //     this.selectedMerryMenIds.push(merryMan.id);
  //     document.getElementById('done_btn').classList.remove(DISABLED);
  //   }
  // }
}
