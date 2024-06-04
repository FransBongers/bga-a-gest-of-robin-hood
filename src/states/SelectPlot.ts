class SelectPlotState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringSelectPlotStateArgs;
  private selectedSpaces: GestSpace[] = [];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringSelectPlotStateArgs) {
    debug('Entering SelectPlotState');
    this.args = args;
    this.selectedSpaces = [];
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
      text: _('${you} must select a Plot'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args.options).forEach(([plotId, data]) => {
      this.game.addPrimaryActionButton({
        id: `${plotId}_btn`,
        text: _(data.plotName),
        callback: () => this.updateInterfaceSelectSpaces({ plotId, data }),
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectSpaces({
    plotId,
    data,
  }: {
    plotId: string;
    data: {
      spaces: GestSpace[];
      numberOfSpaces: number;
      plotName: string;
    };
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text:
        data.numberOfSpaces === 1
          ? _('${you} must select a Space to target')
          : _('${you} must select a Space to target (${number} remaining)'),
      args: {
        you: '${you}',
        number: data.numberOfSpaces - this.selectedSpaces.length,
      },
    });

    this.args.options[plotId].spaces.forEach((space) => {
      this.game.addPrimaryActionButton({
        id: `${space.id}_btn`,
        text: _(space.name),
        callback: () => {
          this.selectedSpaces.push(space);
          if (this.selectedSpaces.length >= data.numberOfSpaces) {
            this.updateInterfaceConfirm({ plotId, data });
          } else {
            this.updateInterfaceSelectSpaces({ plotId, data });
          }
        },
      });
    });
    this.game.addSecondaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm({ plotId, data }),
    });
    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({
    plotId,
    data,
  }: {
    plotId: string;
    data: {
      spaces: GestSpace[];
      numberOfSpaces: number;
      plotName: string;
    };
  }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${plotName} in ${spacesLog}?'),
      args: {
        plotName: _(data.plotName),
        spacesLog: this.createSpacesLog(),
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actSelectPlot',
        args: {
          plotId,
          spaceIds: this.selectedSpaces.map((space) => space.id),
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

  createSpacesLog() {
    switch (this.selectedSpaces.length) {
      case 1:
        return {
          log: '${spaceName}',
          args: {
            spaceName: _(this.selectedSpaces[0].name),
          },
        };
      case 2:
        return {
          log: _('${spaceName} and ${spaceName2}'),
          args: {
            spaceName: _(this.selectedSpaces[0].name),
            spaceName2: _(this.selectedSpaces[1].name),
          },
        };
      case 3:
        return {
          log: _('${spaceName}, ${spaceName2} and ${spaceName3}'),
          args: {
            spaceName: _(this.selectedSpaces[0].name),
            spaceName2: _(this.selectedSpaces[1].name),
            spaceName3: _(this.selectedSpaces[3].name),
          },
        };
      default:
        return '';
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
