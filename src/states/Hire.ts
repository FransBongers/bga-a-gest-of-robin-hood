class HireState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringHireStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringHireStateArgs) {
    debug('Entering HireState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving HireState');
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
      text: this.args.optionalAction
        ? _('${you} may select a space to Hire in')
        : _('${you} must select a space to Hire in'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args.options).forEach(
      ([spaceId, { action, space, max }]) => {
        this.game.addPrimaryActionButton({
          id: `${spaceId}_btn`,
          text: _(space.name),
          callback: () => {
            if (action === 'place') {
              this.updateIntefaceSelectNumber({ action, space, max });
            } else {
              this.updateInterfaceConfirm({ action, space });
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

  private updateIntefaceSelectNumber({
    max,
    space,
    action,
  }: {
    max: number;
    space: GestSpace;
    action: 'place' | 'submit';
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select the number of Henchmen to place'),
      args: {
        you: '${you}',
      },
    });

    for (let i = 1; i <= max; i++) {
      this.game.addPrimaryActionButton({
        id: `place_${i}_btn`,
        text: `${i}`,
        callback: () =>
          this.updateInterfaceConfirm({
            count: i,
            action,
            space,
          }),
      });
    }

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    count = 0,
    space,
    action,
  }: {
    count?: number;
    space: GestSpace;
    action: 'place' | 'submit';
  }) {
    this.game.clearPossible();

    const textMap = {
      place: _('Place ${count} Henchmen in ${spaceName}'),
      submit: _('Set ${spaceName} to Submissive?'),
    };

    this.game.clientUpdatePageTitle({
      text: textMap[action],
      args: {
        spaceName: _(space.name),
        count,
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actHire',
        args: {
          spaceId: space.id,
          count,
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
