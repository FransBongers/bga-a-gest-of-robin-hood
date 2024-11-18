class ChooseActionState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringChooseActionStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringChooseActionStateArgs) {
    debug('Entering ChooseActionState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving ChooseActionState');
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
      text: _('${you} must choose an action or pass'),
      args: {
        you: '${you}',
      },
    });

    this.addActionButtons({ pass: false });
    this.game.addSecondaryActionButton({
      id: 'pass_btn',
      text: _('Pass'),
      callback: () => this.updateInterfaceSelectBoxToPass(),
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectBoxToPass() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a box to place your eligibility cylinder'),
      args: {
        you: '${you}',
      },
    });

    this.addActionButtons({ pass: true });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    action,
    pass,
  }: {
    action: string;
    pass: boolean;
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: pass
        ? _('Pass and move eligibility cylinder to ${actionName}?')
        : _('Perform ${actionName}?'),
      args: {
        actionName: this.getActionName({ action }),
      },
    });

    this.game.setLocationSelected({
      id: `initiativeTrack_${action}_select`,
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actChooseAction',
        args: {
          action,
          pass,
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

  private getActionName({ action }: { action }) {
    switch (action) {
      case SINGLE_PLOT:
        return _('Single Plot');
      case EVENT:
        return _('Event');
      case PLOTS_AND_DEEDS:
        return _('Plots & Deeds');
      default:
        return '';
    }
  }

  addActionButtons({ pass }: { pass: boolean }) {
    [SINGLE_PLOT, EVENT, PLOTS_AND_DEEDS].forEach((action) => {
      if (!this.args.track[action]) {
        return;
      }
      if (action === EVENT && !this.args.canResolveEvent && !pass) {
        return;
      }
      if (action === SINGLE_PLOT && !this.args.canChooseSinglePlot && !pass) {
        return;
      }
      this.game.addPrimaryActionButton({
        id: `${action}_select`,
        text: this.getActionName({ action }),
        callback: () => this.updateInterfaceConfirm({ action, pass }),
      });
      this.game.setLocationSelectable({
        id: `initiativeTrack_${action}_select`,
        callback: () => this.updateInterfaceConfirm({ action, pass }),
      });
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
