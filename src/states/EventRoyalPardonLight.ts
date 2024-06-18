class EventRoyalPardonLightState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringEventRoyalPardonLightStateArgs;
  private merryMenIds: string[];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringEventRoyalPardonLightStateArgs) {
    debug('Entering EventRoyalPardonLightState');
    this.args = args;
    this.merryMenIds = [];
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving EventRoyalPardonLightState');
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
    if (this.merryMenIds.length === this.args._private.count) {
      this.updateInterfaceSelectSpace();
      return;
    }
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _(
        '${you} must select Merry Men to release from Prison (${count} remaining)'
      ),
      args: {
        you: '${you}',
        count: this.args._private.count - this.merryMenIds.length,
      },
    });

    this.args._private.forces.forEach((merryMan) => {
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: () => this.handleMerryManClick({ merryMan }),
      });
    });
    this.merryMenIds.forEach((id) => this.game.setElementSelected({ id }));

    if (this.merryMenIds.length > 0) {
      this.game.addCancelButton();
    } else {
      this.game.addPassButton({
        optionalAction: this.args.optionalAction,
      });
      this.game.addUndoButtons(this.args);
    }
  }

  private updateInterfaceSelectSpace() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a space to place your Merry Men'),
      args: {
        you: '${you}',
      },
    });

    this.merryMenIds.forEach((id) => this.game.setElementSelected({ id }));

    this.args._private.spaces.forEach((space) => {
      this.game.addPrimaryActionButton({
        id: `${space.id}_btn`,
        text: _(space.name),
        callback: () => {
          this.updateInterfaceConfirm({ space });
        },
      });
    });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({ space }: { space: GestSpace }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Place ${count} Merry Men in ${spaceName}?'),
      args: {
        spaceName: _(space.name),
        count: this.merryMenIds.length,
      },
    });
    this.merryMenIds.forEach((id) => this.game.setElementSelected({ id }));

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actEventRoyalPardonLight',
        args: {
          merryMenIds: this.merryMenIds,
          spaceId: space.id,
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
    this.updateInterfaceInitialStep();
  }
}
