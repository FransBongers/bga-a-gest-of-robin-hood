class SelectTravellerCardOptionState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringSelectTravellerCardOptionStateArgs;
  private staticData: GestCardStaticData;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringSelectTravellerCardOptionStateArgs) {
    debug('Entering SelectTravellerCardOptionState');
    this.args = args;
    this.staticData = this.game.getStaticCardData({
      cardId: this.args.card.id,
    });
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving SelectTravellerCardOptionState');
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
      text: _('${you} must select one of the options on the Traveller card'),
      args: {
        you: '${you}',
      },
    });

    this.addOptionButtons();

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceConfirm({ option }: { option: 'dark' | 'light' }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Select ${option}?'),
      args: {
        option:
          option === 'light'
            ? _(this.staticData.titleLight)
            : _(this.staticData.titleDark),
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actSelectTravellerCardOption',
        args: {
          option,
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

  private addOptionButtons() {
    if (this.staticData.titleLight) {
      this.game.addPrimaryActionButton({
        id: `light_option_btn`,
        text: _(this.staticData.titleLight),
        callback: () => this.updateInterfaceConfirm({ option: 'light' }),
      });
    }
    if (this.staticData.titleDark) {
      this.game.addPrimaryActionButton({
        id: `darkt_option_btn`,
        text: _(this.staticData.titleDark),
        callback: () => this.updateInterfaceConfirm({ option: 'dark' }),
      });
    }
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
