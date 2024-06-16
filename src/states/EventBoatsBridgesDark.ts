class EventBoatsBridgesDarkState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringEventBoatsBridgesDarkStateArgs;
  private selectedBorderId: string = '';

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringEventBoatsBridgesDarkStateArgs) {
    debug('Entering EventBoatsBridgesDarkState');
    this.args = args;
    this.selectedBorderId = '';
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving EventBoatsBridgesDarkState');
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
      text: _('${you} may select a River border to place the Bridge'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(RIVER_BORDERS).forEach(([borderId, spaceIds]) =>
      this.game.setElementSelectable({
        id: borderId,
        callback: () => {
          this.selectedBorderId = borderId;
          this.updateInterfaceConfirm();
        },
      })
    );

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.game.setElementSelected({ id: this.selectedBorderId });
    const node = document.getElementById(this.selectedBorderId);
    if (node) {
      node.setAttribute('data-has-bridge', 'true');
    }

    const spaceIds = RIVER_BORDERS[this.selectedBorderId];
    this.game.clientUpdatePageTitle({
      text: _(
        'Place the Bridge on the border between ${spaceName} and ${spaceName2}?  '
      ),
      args: {
        spaceName: this.game.gamedatas.spaces[spaceIds[0]].name,
        spaceName2: this.game.gamedatas.spaces[spaceIds[1]].name,
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actEventBoatsBridgesDark',
        args: {
          borderId: this.selectedBorderId,
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
    this.game.addCancelButton({
      callback: () => {
        const node = document.getElementById(this.selectedBorderId);
        if (node) {
          node.removeAttribute('data-has-bridge');
        }
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
}
