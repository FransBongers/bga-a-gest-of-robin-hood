class SelectPlotState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringSelectPlotStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringSelectPlotStateArgs) {
    debug('Entering SelectPlotState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving SelectPlotState');
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
      text: this.args.extraOptionId
        ? _('${you} must select a Plot')
        : _('${you} must select an option'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args.options).forEach(([plotId, plotName]) => {
      this.game.addPrimaryActionButton({
        id: `${plotId}_btn`,
        text: _(plotName),
        callback: () => this.updateInterfaceConfirm({ plotId, plotName }),
      });
      this.game.setElementSelectable({
        id: `gest_plot_deed_info_${plotId.toLowerCase()}`,
        callback: () => this.updateInterfaceConfirm({ plotId, plotName }),
      });
    });
    if (this.args.extraOptionId) {
      this.addExtraOptionButton();
    }

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
      text: _('Skip Plot'),
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceConfirm({
    plotId,
    plotName,
    extraOptionId,
  }: {
    plotId?: string;
    plotName?: string;
    extraOptionId?: string;
  }) {
    this.game.clearPossible();

    if (plotId) {
      this.game.clientUpdatePageTitle({
        text: _('Perform ${plotName} Plot?'),
        args: {
          plotName: _(plotName),
        },
      });
      this.game.setElementSelected({
        id: `gest_plot_deed_info_${plotId.toLowerCase()}`,
      });
    } else if (extraOptionId) {
      this.game.clientUpdatePageTitle({
        text: _('${extraOptionText}?'),
        args: {
          extraOptionText: _(this.getExtraOptionText({ extraOptionId })),
        },
      });
    }

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actSelectPlot',
        args: {
          plotId,
          extraOptionId,
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

  private getExtraOptionText({ extraOptionId }: { extraOptionId: string }) {
    switch (extraOptionId) {
      case GAIN_TWO_SHILLINGS:
        return _('Gain 2 Shillings');
    }
  }

  private addExtraOptionButton() {
    const { extraOptionId } = this.args;
    switch (extraOptionId) {
      case GAIN_TWO_SHILLINGS:
        this.game.addPrimaryActionButton({
          id: `extraOp_btn`,
          text: _(this.getExtraOptionText({ extraOptionId })),
          callback: () => this.updateInterfaceConfirm({ extraOptionId }),
        });
        break;
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
