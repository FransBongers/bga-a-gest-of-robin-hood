class RobState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringRobStateArgs;
  private selectedMerryMenIds: string[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringRobStateArgs) {
    debug('Entering RobState');
    this.args = args;
    this.selectedMerryMenIds = [];
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
      this.game.addPrimaryActionButton({
        id: `${spaceId}_btn`,
        text: _(option.space.name),
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

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a target'),
      args: {
        you: '${you}',
      },
    });

    targets.forEach((target) => {
      this.game.addPrimaryActionButton({
        id: `${target}_btn`,
        text: _(this.getTargetName({ target })),
        callback: () =>
          this.updateInterfaceSelectMerryMen({
            space: option.space,
            target: target,
            merryMen: option.merryMen
          }),
      });
    });

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
      this.selectedMerryMenIds.push(merryMen[0].id);
      this.updateInterfaceConfirm({
        space,
        target,
      });
      return;
    }

    this.game.clientUpdatePageTitle({
      text: _('${you} must select Merry Men to Rob with'),
      args: {
        you: '${you}',
      },
    });

    merryMen.forEach((merryMan) =>
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: () => this.handleMerryManClick({ merryMan }),
      })
    );

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm({ space, target }),
      extraClasses: DISABLED,
    });
    this.game.addSecondaryActionButton({
      id: 'select_all_btn',
      text: _('Select all'),
      callback: () => {
        this.selectedMerryMenIds = merryMen.map((merryMan) => merryMan.id);
        this.updateInterfaceConfirm({ space, target });
      },
    });

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
      text: _('Rob ${target} in ${spaceName} ${count} Merry Men?'),
      args: {
        spaceName: _(space.name),
        target: this.getTargetName({ target }),
        count: this.selectedMerryMenIds.length,
      },
    });

    this.selectedMerryMenIds.forEach((id) =>
      this.game.setElementSelected({ id })
    );

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actRob',
        args: {
          target,
          spaceId: space.id,
          merryMenIds: this.selectedMerryMenIds,
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

  private getTargetName({
    target,
  }: {
    target:
      | 'traveller'
      | 'treasury'
      | 'HiddenCarriage'
      | 'TallageCarriage'
      | 'TrapCarriage'
      | 'TributeCarriage';
  }): string {
    switch (target) {
      case 'treasury':
        return _("the Sheriff's Treasury");
      case 'traveller':
        return _('a random Traveller');
        return;
      case 'HiddenCarriage':
      case 'TallageCarriage':
      case 'TrapCarriage':
      case 'TributeCarriage':
        return _(target);
    }
  }

  // .##.....##....###....##....##.########..##.......########..######.
  // .##.....##...##.##...###...##.##.....##.##.......##.......##....##
  // .##.....##..##...##..####..##.##.....##.##.......##.......##......
  // .#########.##.....##.##.##.##.##.....##.##.......######....######.
  // .##.....##.#########.##..####.##.....##.##.......##.............##
  // .##.....##.##.....##.##...###.##.....##.##.......##.......##....##
  // .##.....##.##.....##.##....##.########..########.########..######.

  private handleMerryManClick({ merryMan }: { merryMan: GestForce }) {
    if (this.selectedMerryMenIds.includes(merryMan.id)) {
      this.game.removeSelectedFromElement({ id: merryMan.id });
      this.selectedMerryMenIds = this.selectedMerryMenIds.filter(
        (id) => id !== merryMan.id
      );
      if (this.selectedMerryMenIds.length === 0) {
        console.log('add disabled');
        document.getElementById('done_btn').classList.add(DISABLED);
      }
    } else {
      this.game.setElementSelected({ id: merryMan.id });
      this.selectedMerryMenIds.push(merryMan.id);
      document.getElementById('done_btn').classList.remove(DISABLED);
    }
  }
}
