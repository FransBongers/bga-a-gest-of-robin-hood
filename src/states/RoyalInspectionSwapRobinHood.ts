class RoyalInspectionSwapRobinHoodState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringRoyalInspectionSwapRobinHoodStateArgs;
  private localMoves: Record<string, GestForce[]>;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringRoyalInspectionSwapRobinHoodStateArgs) {
    debug('Entering RoyalInspectionSwapRobinHoodState');
    this.args = args;
    this.localMoves = {};
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving RoyalInspectionSwapRobinHoodState');
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
      text: _('${you} may select a Merry Man to swap with Robin Hood'),
      args: {
        you: '${you}',
      },
    });

    Object.values(this.args._private.merryMen).forEach((merryMan) => {
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: async () => {
          const robinHood = this.args._private.robinHood;
          const currentRobinHoodLocation = robinHood.location;
          const currentMerryManLocation = merryMan.location;
          merryMan.location = currentRobinHoodLocation;
          robinHood.location = currentMerryManLocation;
          await Promise.all([
            this.game.gameMap.forces[
              `${MERRY_MEN}_${merryMan.location}`
            ].addCard(merryMan),
            this.game.gameMap.forces[
              `${MERRY_MEN}_${robinHood.location}`
            ].addCard(robinHood),
          ]);
          this.addLocalMove({
            fromSpaceId: currentRobinHoodLocation,
            force: robinHood,
          });
          this.addLocalMove({
            fromSpaceId: currentMerryManLocation,
            force: merryMan,
          });
          this.updateInterfaceConfirm({ merryManId: merryMan.id });
        },
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  // private updateInterfacePlaceRobinHood({ space }: { space: GestSpace }) {
  //   this.game.clearPossible();

  //   this.game.clientUpdatePageTitle({
  //     text: _('Place Robin Hood?'),
  //     args: {},
  //   });

  //   this.game.addPrimaryActionButton({
  //     id: 'yes_btn',
  //     text: _('Yes'),
  //     callback: () =>
  //       this.updateInterfaceConfirm({ space, placeRobinHood: true }),
  //   });
  //   this.game.addPrimaryActionButton({
  //     id: 'no_btn',
  //     text: _('No'),
  //     callback: () =>
  //       this.updateInterfaceConfirm({ space, placeRobinHood: false }),
  //   });
  //   this.game.addCancelButton();
  // }

  private updateInterfaceConfirm({ merryManId }: { merryManId: string }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Confirm swap?'),
      args: {},
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actRoyalInspectionSwapRobinHood',
        args: {
          merryManId,
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

    this.addCancelButton();
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private addLocalMove({
    fromSpaceId,
    force,
  }: {
    fromSpaceId: string;
    force: GestForce;
  }) {
    if (this.localMoves[fromSpaceId]) {
      this.localMoves[fromSpaceId].push(force);
    } else {
      this.localMoves[fromSpaceId] = [force];
    }
  }

  private addCancelButton() {
    this.game.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: async () => {
        await this.revertLocalMoves();
        this.game.onCancel();
      },
    });
  }

  private async revertLocalMoves() {
    const promises = [];

    Object.entries(this.localMoves).forEach(([spaceId, forces]) => {
      promises.push(
        this.game.gameMap.forces[`${MERRY_MEN}_${spaceId}`].addCards(
          forces.map((force) => {
            return {
              ...force,
              location: spaceId,
            };
          })
        )
      );
    });

    await Promise.all(promises);
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
