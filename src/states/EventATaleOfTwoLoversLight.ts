class EventATaleOfTwoLoversLightState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringEventATaleOfTwoLoversLightStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringEventATaleOfTwoLoversLightStateArgs) {
    debug('Entering EventATaleOfTwoLoversLightState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving EventATaleOfTwoLoversLightState');
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
      text: _('${you} must select a Space'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args._private).forEach(([spaceId, option]) =>
      this.game.setSpaceSelectable({
        id: spaceId,
        callback: () => this.updateInterfaceSelectMerryMen(option),
      })
    );

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectMerryMen({
    space,
    merryMen,
    henchmen,
  }: {
    space: GestSpace;
    merryMen: GestForce[];
    henchmen: GestForce[];
  }) {
    this.game.clearPossible();
    if (merryMen.length === 1) {
      this.updateInterfaceSelectHenchmen({
        space,
        henchmen,
        merryMan: merryMen[0],
      });
      return;
    }

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Merry Man to remove from the game'),
      args: {
        you: '${you}',
      },
    });

    merryMen.forEach((merryMan) => {
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: () =>
          this.updateInterfaceSelectHenchmen({ space, merryMan, henchmen }),
      });
    });

    this.game.addCancelButton();
  }

  private updateInterfaceSelectHenchmen({
    space,
    merryMan,
    henchmen,
  }: {
    space: GestSpace;
    merryMan: GestForce;
    henchmen: GestForce[];
  }) {
    this.game.clearPossible();
    if (henchmen.length === 0) {
      this.updateInterfaceConfirm({ space, merryMan, henchmenCount: 0 });
      return;
    }

    this.game.clientUpdatePageTitle({
      text: _('${you} must choose how many Henchmen to remove from the game'),
      args: {
        you: '${you}',
      },
    });
    this.game.setElementSelected({ id: merryMan.id });

    for (let i = 0; i <= Math.min(henchmen.length, 2); i++) {
      this.game.addPrimaryActionButton({
        id: `${i}_btn`,
        text: `${i}`,
        callback: () => {
          this.updateInterfaceConfirm({ space, henchmenCount: i, merryMan });
        },
      });
    }

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    space,
    merryMan,
    henchmenCount,
  }: {
    space: GestSpace;
    merryMan: GestForce;
    henchmenCount: number;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _(
        'Remove 1 Merry Man and ${count} Henchmen from ${spaceName} from the game?'
      ),
      args: {
        spaceName: _(space.name),
        count: henchmenCount,
      },
    });
    this.game.setElementSelected({ id: merryMan.id });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actEventATaleOfTwoLoversLight',
        args: {
          spaceId: space.id,
          merryManId: merryMan.id,
          henchmenCount,
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
