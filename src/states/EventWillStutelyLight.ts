class EventWillStutelyLightState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringEventWillStutelyLightStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringEventWillStutelyLightStateArgs) {
    debug('Entering EventWillStutelyLightState');
    this.args = args;

    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving EventWillStutelyLightState');
  }

  setDescription(
    activePlayerId: number,
    args: OnEnteringEventWillStutelyLightStateArgs
  ) {}

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
      text: _('${you} must select a Merry Man to move'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args._private).forEach(
      ([merryManId, { merryMan, adjacentParishIds }]) => {
        this.game.setElementSelectable({
          id: merryManId,
          callback: () =>
            this.updateInterfaceSelectAdjacentParish({
              merryMan,
              adjacentParishIds,
            }),
        });
      }
    );

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectAdjacentParish({
    adjacentParishIds,
    merryMan,
  }: {
    merryMan: GestForce;
    adjacentParishIds: string[];
  }) {
    if (adjacentParishIds.length === 1) {
      this.updateInterfaceConfirm({ merryMan, parishId: adjacentParishIds[0] });
      return;
    }
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Parish to move your Merry Man to'),
      args: {
        you: '${you}',
      },
    });

    this.game.setElementSelected({ id: merryMan.id });

    adjacentParishIds.forEach((parishId) => {
      this.game.setSpaceSelectable({
        id: parishId,
        callback: () => this.updateInterfaceConfirm({ merryMan, parishId }),
      });
    });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    merryMan,
    parishId,
  }: {
    merryMan: GestForce;
    parishId: string;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Move your Merry Man to ${spaceName}?'),
      args: {
        spaceName: _(this.game.gamedatas.spaces[parishId].name),
      },
    });

    this.game.setElementSelected({ id: merryMan.id });
    this.game.setSpaceSelected({ id: parishId });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actEventWillStutelyLight',
        args: {
          merryManId: merryMan.id,
          parishId,
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
