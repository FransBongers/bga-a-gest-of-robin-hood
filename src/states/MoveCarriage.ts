class MoveCarriageState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringMoveCarriageStateArgs;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringMoveCarriageStateArgs) {
    debug('Entering MoveCarriageState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving MoveCarriageState');
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
      text: _('${you} must select a Carriage to move'),
      args: {
        you: '${you}',
      },
    });

    this.setCarriagesSelectable();
    // this.addActionButtons();

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceBringHenchman({
    carriage,
    from,
    to,
  }: {
    carriage: GestForce;
    from: GestSpace;
    to: GestSpace;
  }) {
    this.game.clearPossible();
    this.game.setElementSelected({ id: carriage.id });

    this.game.clientUpdatePageTitle({
      text: _('Bring one Henchman along with Carriage?'),
      args: {},
    });

    this.game.addPrimaryActionButton({
      id: 'yes_btn',
      text: _('Yes'),
      callback: () =>
        this.updateInterfaceConfirm({
          carriage,
          from,
          to,
          bringHenchman: true,
        }),
    });
    this.game.addPrimaryActionButton({
      id: 'no_btn',
      text: _('No'),
      callback: () =>
        this.updateInterfaceConfirm({
          carriage,
          from,
          to,
          bringHenchman: false,
        }),
    });
    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    carriage,
    from,
    to,
    bringHenchman,
  }: {
    carriage: GestForce;
    from: GestSpace;
    to: GestSpace;
    bringHenchman: boolean;
  }) {
    this.game.clearPossible();
    this.game.setElementSelected({ id: carriage.id });

    this.game.clientUpdatePageTitle({
      text: bringHenchman
        ? _('Move Carriage and Henchman from ${fromName} to ${toName}?')
        : _('Move Carriage from ${fromName} to ${toName}?'),
      args: {
        fromName: _(from.name),
        toName: _(to.name),
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actMoveCarriage',
        args: {
          carriageId: carriage.id,
          bringHenchman,
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

  setCarriagesSelectable() {
    if (!this.args._private?.options) {
      return;
    }
    Object.entries(this.args._private.options).forEach(
      ([carriageId, option]) => {
        this.game.setElementSelectable({
          id: carriageId,
          callback: () => {
            if (option.canBringHenchman) {
              this.updateInterfaceBringHenchman({
                carriage: option.carriage,
                from: option.from,
                to: option.to,
              });
            } else {
              this.updateInterfaceConfirm({
                carriage: option.carriage,
                from: option.from,
                to: option.to,
                bringHenchman: false,
              });
            }
            console.log('option', option);
          },
        });
      }
    );
  }

  // addActionButtons() {
  //   [SINGLE_PLOT, EVENT, PLOTS_AND_DEEDS].forEach((action) => {
  //     if (this.args[action]) {
  //       this.game.addPrimaryActionButton({
  //         id: `${action}_select`,
  //         text: this.getActionName({ action }),
  //         callback: () => this.updateInterfaceConfirm({ action }),
  //       });
  //     }
  //   });
  // }

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
