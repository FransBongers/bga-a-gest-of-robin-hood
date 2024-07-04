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

  private updateInterfaceSelectTo({ option }: { option: MoveCarriageOption }) {
    if (option.to.length === 1) {
      this.updateInterfaceBringHenchman({
        carriage: option.carriage,
        to: option.to[0],
        from: option.from,
        canBringHenchman: option.canBringHenchman,
      });
      return;
    }
    this.game.clearPossible();
    this.game.setElementSelected({ id: option.carriage.id });

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Space to move you Carriage to'),
      args: {
        you: '${you}',
      },
    });

    option.to.forEach((space) => {
      this.game.setSpaceSelectable({
        id: space.id,
        callback: () => {
          this.updateInterfaceBringHenchman({
            carriage: option.carriage,
            to: space,
            from: option.from,
            canBringHenchman: option.canBringHenchman,
          });
        },
      });
    });

    this.game.addCancelButton();
  }

  private updateInterfaceBringHenchman({
    carriage,
    from,
    to,
    canBringHenchman,
  }: {
    carriage: GestForce;
    from: GestSpace;
    to: GestSpace;
    canBringHenchman: boolean;
  }) {
    if (!canBringHenchman) {
      this.updateInterfaceConfirm({
        carriage,
        to,
        from,
        bringHenchman: false,
      });
      return;
    }

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
          toSpaceId: to.id,
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
            this.updateInterfaceSelectTo({
              option,
            });
          },
        });
      }
    );
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
