class SelectEventEffectState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringSelectEventEffectStateArgs;
  private staticData: GestCardStaticData;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringSelectEventEffectStateArgs) {
    debug('Entering SelectEventEffectState');
    this.args = args;
    this.staticData = this.game.getStaticCardData({
      cardId: this.args.card.id,
    });
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving SelectEventEffectState');
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
      text: _(
        '${you} must select which effect on the current Event card to execute'
      ),
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

  private updateInterfaceConfirm({ effect }: { effect: 'dark' | 'light' }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('Execute ${option}?'),
      args: {
        option:
          effect === 'light'
            ? _(this.staticData.titleLight)
            : _(this.staticData.titleDark),
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actSelectEventEffect',
        args: {
          effect,
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
    if (this.staticData.titleLight && this.args.canPerformLightEffect) {
      this.game.addPrimaryActionButton({
        id: `light_option_btn`,
        text: _(this.staticData.titleLight),
        callback: () => this.updateInterfaceConfirm({ effect: 'light' }),
      });
    }
    if (this.staticData.titleDark && this.args.canPerformDarkEffect) {
      this.game.addPrimaryActionButton({
        id: `darkt_option_btn`,
        text: _(this.staticData.titleDark),
        callback: () => this.updateInterfaceConfirm({ effect: 'dark' }),
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
