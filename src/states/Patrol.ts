class PatrolState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringPatrolStateArgs;
  private selectedHenchmenIds: string[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringPatrolStateArgs) {
    debug('Entering PatrolState');
    this.selectedHenchmenIds = [];
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving PatrolState');
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
      text: _('${you} must select a Space to move Henchmen to'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args.options).forEach(
      ([spaceId, { space, adjacentHenchmen }]) => {
        this.game.addPrimaryActionButton({
          id: `${spaceId}_btn`,
          text: _(space.name),
          callback: () => {
            if (adjacentHenchmen.length > 0) {
              this.updateInterfaceSelectHenchmen({ space, adjacentHenchmen });
            } else {
              this.updateInterfaceConfirm({ space });
            }
          },
        });
      }
    );

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectHenchmen({
    adjacentHenchmen,
    space,
  }: {
    space: GestSpace;
    adjacentHenchmen: GestForce[];
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select Henchmen to move to ${spaceName}'),
      args: {
        you: '${you}',
        spaceName: _(space.name),
      },
    });

    adjacentHenchmen.forEach((henchman) => {
      this.game.setElementSelectable({
        id: henchman.id,
        callback: () => this.handleHenchmenClick({ henchman }),
      });
    });
    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm({ space }),
    });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({ space }: { space: GestSpace }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text:
        this.selectedHenchmenIds.length > 0
          ? _('Move ${count} Henchmen to ${spaceName} and Patrol?')
          : _('Patrol in ${spaceName}?'),
      args: {
        spaceName: _(space.name),
        count: this.selectedHenchmenIds.length,
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actPatrol',
        args: {
          spaceId: space.id,
          henchmenIds: this.selectedHenchmenIds,
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

  private handleHenchmenClick({ henchman }: { henchman: GestForce }) {
    if (this.selectedHenchmenIds.includes(henchman.id)) {
      this.game.removeSelectedFromElement({ id: henchman.id });
      this.selectedHenchmenIds = this.selectedHenchmenIds.filter(
        (id) => id !== henchman.id
      );
    } else {
      this.game.setElementSelected({ id: henchman.id });
      this.selectedHenchmenIds.push(henchman.id);
    }
  }
}
