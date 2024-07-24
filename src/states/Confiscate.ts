class ConfiscateState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringConfiscateStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringConfiscateStateArgs) {
    debug('Entering ConfiscateState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving ConfiscateState');
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
      text: _('${you} must select a Parish to Confiscate in'),
      args: {
        you: '${you}',
      },
    });

    this.args._private.spaces.forEach((space) =>
      this.game.setSpaceSelectable({
        id: space.id,
        callback: () => this.updateInterfaceSelectCarriage({ space }),
      })
    );

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectCarriage({ space }: { space: GestSpace }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select which type of Carriage to place'),
      args: {
        you: '${you}',
      },
    });

    this.args._private.availableCarriageTypes.forEach((carriageType) =>
      this.game.addSecondaryActionButton({
        id: `${carriageType}_btn`,
        text: this.game.format_string_recursive('${tkn_carriage}', {
          tkn_carriage: `${REVEALED}:${carriageType}`,
        }),
        callback: () => this.updateInterfaceConfirm({ space, carriageType }),
      })
    );

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    carriageType,
    space,
  }: {
    carriageType: string;
    space: GestSpace;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Place ${tkn_carriage} in ${spaceName}?'),
      args: {
        spaceName: _(space.name),
        tkn_carriage: `${REVEALED}:${carriageType}`,
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actConfiscate',
        args: {
          spaceId: space.id,
          carriageType,
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
