class RoyalInspectionRedeploymentRobinHoodState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringRoyalInspectionRedeploymentRobinHoodStateArgs;
  private requiredMoves: Record<string, string | null>;
  private optionalMoves: Record<string, string | null>;
  private localMoves: Record<string, GestForce[]>;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(
    args: OnEnteringRoyalInspectionRedeploymentRobinHoodStateArgs
  ) {
    debug('Entering RoyalInspectionRedeploymentRobinHoodState');
    this.args = args;
    this.localMoves = {};

    this.optionalMoves = {};
    Object.keys(this.args._private.merryMenMayMove).forEach((key) => {
      this.optionalMoves[key] = null;
    });

    this.requiredMoves = {};
    Object.keys(this.args._private.merryMenMustMove).forEach((key) => {
      this.requiredMoves[key] = null;
    });

    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving RoyalInspectionRedeploymentRobinHoodState');
  }

  setDescription(activePlayerId: number, args: OnEnteringRoyalInspectionRedeploymentRobinHoodStateArgs) {
    if (args.source === 'Event14_TemporaryTruce') {
      this.game.clientUpdatePageTitle({
        text: _('${actplayer} may move all Merry Men to Camps or Forests'),
        args: {
          actplayer: '${actplayer}',
        },
        nonActivePlayers: true,
      });
    }
  }

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

    if (!Object.values(this.requiredMoves).some((dest) => dest === null)) {
      this.updateInterfaceOptionalMoves();
      return;
    }

    this.updatePageTitle();

    Object.entries(this.args._private.merryMenMustMove).forEach(
      ([merryManId, option]) => {
        if (this.requiredMoves[merryManId] !== null) {
          return;
        }
        this.game.setElementSelectable({
          id: merryManId,
          callback: () => this.updateInterfaceSelectDestination({ option }),
        });
      }
    );

    if (Object.values(this.requiredMoves).some((dest) => dest !== null)) {
      this.addCancelButton();
    } else {
      this.game.addPassButton({
        optionalAction: this.args.optionalAction,
      });
      this.game.addUndoButtons(this.args);
    }
  }

  private updateInterfaceSelectDestination({
    option,
    optionalMove = false,
  }: {
    option: RedeploymentOptionRH;
    optionalMove?: boolean;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Space to move your Merry Man to'),
      args: {
        you: '${you}',
      },
    });

    this.game.setElementSelected({ id: option.merryMan.id });

    option.spaceIds.forEach((spaceId) => {
      this.game.setSpaceSelectable({
        id: spaceId,
        callback: async () => {
          if (optionalMove) {
            this.optionalMoves[option.merryMan.id] = spaceId;
          } else {
            this.requiredMoves[option.merryMan.id] = spaceId;
          }

          const merryMan = option.merryMan;
          this.addLocalMove({
            fromSpaceId: merryMan.location,
            force: merryMan,
          });

          merryMan.location = spaceId;
          await this.game.gameMap.forces[`${MERRY_MEN}_${spaceId}`].addCard(
            merryMan
          );
          if (optionalMove) {
            this.updateInterfaceOptionalMoves();
          } else {
            this.updateInterfaceInitialStep();
          }
        },
      });
    });

    this.addCancelButton();
  }

  private updateInterfaceOptionalMoves() {
    this.game.clearPossible();

    if (!Object.values(this.optionalMoves).some((dest) => dest === null)) {
      this.updateInterfaceConfirm();
      return;
    }

    this.game.clientUpdatePageTitle({
      text: _(
        '${you} may select other Merry Man to move to a Forest or a Parish with a Camp'
      ),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args._private.merryMenMayMove).forEach(
      ([merryManId, option]) => {
        if (this.optionalMoves[merryManId] !== null) {
          return;
        }
        this.game.setElementSelectable({
          id: merryManId,
          callback: () =>
            this.updateInterfaceSelectDestination({
              option,
              optionalMove: true,
            }),
        });
      }
    );

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm(),
    });

    // Object.entries(this.args.merryMenMayMove).forEach(
    //   ([henchmanId, option]) => {
    //     if (this.optionalMoveIds.includes(henchmanId)) {
    //       return;
    //     }

    //     this.game.setElementSelectable({
    //       id: henchmanId,
    //       callback: async () => {
    //         this.optionalMoveIds.push(henchmanId);
    //         const henchman = option.henchman;
    //         henchman.location = NOTTINGHAM;
    //         await this.game.gameMap.forces[`${HENCHMEN}_${NOTTINGHAM}`].addCard(
    //           henchman
    //         );
    //         this.updateInterfaceOptionalMoves();
    //       },
    //     });
    //   }
    // );

    this.addCancelButton();
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Confirm moves?'),
      args: {},
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actRoyalInspectionRedeploymentRobinHood',
        args: {
          requiredMoves: this.requiredMoves,
          optionalMoves: this.optionalMoves,
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

  //  ..######..##.......####..######..##....##
  //  .##....##.##........##..##....##.##...##.
  //  .##.......##........##..##.......##..##..
  //  .##.......##........##..##.......#####...
  //  .##.......##........##..##.......##..##..
  //  .##....##.##........##..##....##.##...##.
  //  ..######..########.####..######..##....##

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

  // .##.....##....###....##....##.########..##.......########..######.
  // .##.....##...##.##...###...##.##.....##.##.......##.......##....##
  // .##.....##..##...##..####..##.##.....##.##.......##.......##......
  // .#########.##.....##.##.##.##.##.....##.##.......######....######.
  // .##.....##.#########.##..####.##.....##.##.......##.............##
  // .##.....##.##.....##.##...###.##.....##.##.......##.......##....##
  // .##.....##.##.....##.##....##.########..########.########..######.

  private updatePageTitle() {
    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Merry Man to move'),
      args: {
        you: '${you}',
        // count:
        //   this.args._private.numberToReturn - this.selectedMerryMenIds.length,
      },
    });
  }
}
