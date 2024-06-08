class PlaceMerryManInSpaceState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringPlaceMerryManInSpaceStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringPlaceMerryManInSpaceStateArgs) {
    debug('Entering PlaceMerryManInSpaceState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving PlaceMerryManInSpaceState');
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
      text: _('${you} must select a Space place a Merry Man in'),
      args: {
        you: '${you}',
      },
    });

    Object.values(this.args._private.spaces).forEach((space) => {
      this.game.addPrimaryActionButton({
        id: `${space.id}_btn`,
        text: _(space.name),
        callback: () => {
          if (
            this.args._private.robinHoodInSupply &&
            !this.args._private.merryMenInSupply
          ) {
            this.updateInterfaceConfirm({ space, placeRobinHood: true });
          } else if (this.args._private.robinHoodInSupply) {
            this.updateInterfacePlaceRobinHood({ space });
          } else {
            this.updateInterfaceConfirm({ space });
          }
        },
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfacePlaceRobinHood({ space }: { space: GestSpace }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Place Robin Hood?'),
      args: {},
    });

    this.game.addPrimaryActionButton({
      id: 'yes_btn',
      text: _('Yes'),
      callback: () =>
        this.updateInterfaceConfirm({ space, placeRobinHood: true }),
    });
    this.game.addPrimaryActionButton({
      id: 'no_btn',
      text: _('No'),
      callback: () =>
        this.updateInterfaceConfirm({ space, placeRobinHood: false }),
    });
    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    space,
    placeRobinHood = false,
  }: {
    space: GestSpace;
    placeRobinHood?: boolean;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: placeRobinHood
        ? _('Place Robin Hood in ${spaceName}?')
        : _('Place a Merry Man in ${spaceName}?'),
      args: {
        spaceName: _(space.name),
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actPlaceMerryManInSpace',
        args: {
          spaceId: space.id,
          placeRobinHood,
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
