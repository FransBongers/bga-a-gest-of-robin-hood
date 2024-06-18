class RoyalInspectionRedeploymentSheriffState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringRoyalInspectionRedeploymentSheriffStateArgs;
  private requiredMoves: Record<string, string | null>;
  private optionalMoveIds: string[];
  private localMoves: Record<string, GestForce[]>;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringRoyalInspectionRedeploymentSheriffStateArgs) {
    debug('Entering RoyalInspectionRedeploymentSheriffState');
    this.args = args;
    this.optionalMoveIds = [];
    this.localMoves = {};

    this.requiredMoves = {};
    Object.keys(this.args.henchmenMustMove).forEach((key) => {
      this.requiredMoves[key] = null;
    });

    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving RoyalInspectionRedeploymentSheriffState');
  }

  setDescription(activePlayerId: number, args: OnEnteringRoyalInspectionRedeploymentSheriffStateArgs) {
    if (args.source === 'Event14_TemporaryTruce') {
      this.game.clientUpdatePageTitle({
        text: _('${actplayer} may move all Henchmen to Submissive spaces'),
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

    Object.entries(this.args.henchmenMustMove).forEach(
      ([henchmanId, option]) => {
        if (this.requiredMoves[henchmanId] !== null) {
          return;
        }
        this.game.setElementSelectable({
          id: henchmanId,
          callback: () => this.updateInterfaceSelectDestination({ option }),
        });
      }
    );

    console.log('required', this.requiredMoves,Object.values(this.requiredMoves));
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
  }: {
    option: RedeploymentOption;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Space to move your Henchman to'),
      args: {
        you: '${you}',
      },
    });

    this.game.setElementSelected({ id: option.henchman.id });

    option.spaceIds.forEach((spaceId) => {
      this.game.addPrimaryActionButton({
        id: `${spaceId}_btn`,
        text: _(this.args.spaces[spaceId].name),
        callback: async () => {
          this.requiredMoves[option.henchman.id] = spaceId;
          const henchman = option.henchman;
          this.addLocalMove({
            fromSpaceId: henchman.location,
            force: henchman,
          });
          henchman.location = spaceId;
          await this.game.gameMap.forces[`${HENCHMEN}_${spaceId}`].addCard(
            henchman
          );
          this.updateInterfaceInitialStep();
        },
      });
    });

    this.addCancelButton();
  }

  private updateInterfaceOptionalMoves() {
    this.game.clearPossible();

    if (
      this.optionalMoveIds.length ===
      Object.keys(this.args.henchmenMayMove).length
    ) {
      this.updateInterfaceConfirm();
      return;
    }

    this.game.clientUpdatePageTitle({
      text: _('${you} may select other Henchmen to move to Nottingham'),
      args: {
        you: '${you}',
      },
    });

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm(),
    });

    Object.entries(this.args.henchmenMayMove).forEach(
      ([henchmanId, option]) => {
        if (this.optionalMoveIds.includes(henchmanId)) {
          return;
        }

        this.game.setElementSelectable({
          id: henchmanId,
          callback: async () => {
            this.optionalMoveIds.push(henchmanId);
            const henchman = option.henchman;
            henchman.location = NOTTINGHAM;
            await this.game.gameMap.forces[`${HENCHMEN}_${NOTTINGHAM}`].addCard(
              henchman
            );
            this.updateInterfaceOptionalMoves();
          },
        });
      }
    );

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
        action: 'actRoyalInspectionRedeploymentSheriff',
        args: {
          requiredMoves: this.requiredMoves,
          optionalMoves: this.optionalMoveIds,
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

  private updatePageTitle() {
    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Henchman to move'),
      args: {
        you: '${you}',
        // count:
        //   this.args._private.numberToReturn - this.selectedMerryMenIds.length,
      },
    });
  }

  // private handleMerryManClick({ merryMan }: { merryMan: GestForce }) {
  //   if (this.selectedMerryMenIds.includes(merryMan.id)) {
  //     this.game.removeSelectedFromElement({ id: merryMan.id });
  //     this.selectedMerryMenIds = this.selectedMerryMenIds.filter(
  //       (id) => id !== merryMan.id
  //     );
  //   } else {
  //     this.game.setElementSelected({ id: merryMan.id });
  //     this.selectedMerryMenIds.push(merryMan.id);
  //   }
  //   if (this.selectedMerryMenIds.length === this.args._private.numberToReturn) {
  //     this.updateInterfaceConfirm();
  //   }
  // }
}
