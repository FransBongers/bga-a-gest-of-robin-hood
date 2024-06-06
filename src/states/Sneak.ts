class SneakState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringSneakStateArgs;
  private selectedSpace: string | null = null;
  private selectedMerryMen: string[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringSneakStateArgs) {
    debug('Entering SneakState');
    this.args = args;
    this.selectedSpace = null;
    this.selectedMerryMen = [];
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving SneakState');
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
      text: _('${you} must select Merry Men to move'),
      args: {
        you: '${you}',
      },
    });

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceSelectAdjacentSpace(),
      extraClasses:
        this.selectedSpace === null || this.selectedMerryMen.length === 0
          ? 'disabled'
          : '',
    });

    this.setMerryMenSelectable();

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    if (this.selectedSpace !== null) {
      this.game.addCancelButton();
    } else {
      this.game.addUndoButtons(this.args);
    }
  }

  private updateInterfaceSelectAdjacentSpace() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select an adjacent space to move to'),
      args: {
        you: '${you}',
      },
    });

    this.selectedMerryMen.forEach((merryManId) =>
      this.game.setElementSelected({ id: merryManId })
    );
    const option = this.args._private.options[this.selectedSpace];
    option.adjacentSpaces.forEach((space) => {
      this.game.addPrimaryActionButton({
        id: `${space.id}_btn`,
        text: _(space.name),
        callback: () => this.updateInterfaceConfirm({ toSpace: space }),
      });
    });
    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({ toSpace }: { toSpace: GestSpace }) {
    this.game.clearPossible();

    this.selectedMerryMen.forEach((merryManId) =>
      this.game.setElementSelected({ id: merryManId })
    );

    this.game.clientUpdatePageTitle({
      text: _('Move Merry Men to ${spacesName}?'),
      args: {
        spacesName: _(toSpace.name),
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actSneak',
        args: {
          fromSpaceId: this.selectedSpace,
          toSpaceId: toSpace.id,
          merryMenIds: this.selectedMerryMen,
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

  setMerryMenSelectable() {
    console.log('setMerryMenSelectable', this.selectedSpace);

    Object.entries(this.args._private.options).forEach(([spaceId, option]) => {
      if (this.selectedSpace && this.selectedSpace !== spaceId) {
        return;
      }
      option.merryMen.forEach((merryMan) => {
        if (
          this.selectedMerryMen.some((selectedId) => selectedId === merryMan.id)
        ) {
          this.game.setElementSelected({ id: merryMan.id });
          this.game.setElementSelectable({
            id: merryMan.id,
            callback: () =>
              this.handleMerryMenClick({
                currentStatus: 'selected',
                merryManId: merryMan.id,
                spaceId: option.space.id,
              }),
          });
        } else {
          this.game.setElementSelectable({
            id: merryMan.id,
            callback: () =>
              this.handleMerryMenClick({
                currentStatus: 'selectable',
                merryManId: merryMan.id,
                spaceId: option.space.id,
              }),
          });
        }
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

  private handleMerryMenClick({
    currentStatus,
    merryManId,
    spaceId,
  }: {
    currentStatus: 'selected' | 'selectable';
    merryManId: string;
    spaceId: string;
  }) {
    console.log('handleMerryMenClick', currentStatus, merryManId, spaceId);
    if (currentStatus === 'selectable') {
      this.selectedMerryMen.push(merryManId);
    } else if (currentStatus === 'selected') {
      this.selectedMerryMen = this.selectedMerryMen.filter(
        (id) => id !== merryManId
      );
    }
    console.log('merryMen', this.selectedMerryMen);
    if (currentStatus === 'selectable' && this.selectedSpace === null) {
      this.selectedSpace = spaceId;
    } else if (
      currentStatus === 'selected' &&
      this.selectedMerryMen.length === 0
    ) {
      this.selectedSpace = null;
    }
    this.updateInterfaceInitialStep();
  }
}
