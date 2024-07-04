class PlaceHenchmenState extends PlaceForcesState implements State {
  private args: OnEnteringPlaceHenchmenStateArgs;
  private placedHenchmen: GestForce[];
  private spaceId: string | null;

  constructor(game: AGestOfRobinHoodGame) {
    super(game);
  }

  onEnteringState(args: OnEnteringPlaceHenchmenStateArgs) {
    debug('Entering PlaceHenchmenState');
    this.args = args;
    this.placedHenchmen = [];
    this.spaceId = null;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving PlaceHenchmenState');
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
    if (this.placedHenchmen.length === this.args.maxNumber) {
      this.updateInterfaceConfirm();
      return;
    }
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _(
        '${you} must select a Parish to place a Henchman in (${count} remaining)'
      ),
      args: {
        you: '${you}',
        count: this.args.maxNumber - this.placedHenchmen.length,
      },
    });

    Object.entries(this.args.spaces)
      .filter(([spaceId, space]) => {
        return this.spaceId === null ? true : spaceId === this.spaceId;
      })
      .forEach(([spaceId, space]) =>
        this.game.setSpaceSelectable({
          id: space.id,
          callback: async () => this.handlePlacement({ spaceId }),
        })
      );

    if (this.placedHenchmen.length > 0) {
      this.game.addSecondaryActionButton({
        id: 'done_btn',
        text: _('Done'),
        callback: () => this.updateInterfaceConfirm(),
      });
      this.addCancelButton();
    } else {
      this.game.addPassButton({
        optionalAction: this.args.optionalAction,
      });
      this.game.addUndoButtons(this.args);
    }
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Confirm placement?'),
      args: {},
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actPlaceHenchmen',
        args: {
          placedHenchmen: this.placedHenchmen.map((force) => ({
            henchmanId: force.id,
            spaceId: force.location,
          })),
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

  private addCancelButton() {
    this.game.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: async () => {
        await Promise.all(
          this.placedHenchmen.map((henchman) =>
            this.game.forceManager.removeCard(henchman)
          )
        );
        this.game.onCancel();
      },
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

  private async handlePlacement({ spaceId }: { spaceId: string }) {
    const henchman = this.args.henchmen.find(
      (force) => !this.placedHenchmen.some((placed) => placed.id === force.id)
    );
    henchman.location = spaceId;
    this.placedHenchmen.push(henchman);
    await this.game.gameMap.forces[`${HENCHMEN}_${spaceId}`].addCard(henchman);
    if (this.args.conditions.includes(ONE_SPACE)) {
      this.spaceId = spaceId;
    }
    this.updateInterfaceInitialStep();
  }
}
