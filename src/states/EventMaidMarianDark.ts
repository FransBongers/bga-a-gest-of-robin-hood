class EventMaidMarianDarkState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringEventMaidMarianDarkStateArgs;
  private carriageId: string;
  private option: MainMarianOption;
  private merryMenSpaceId: string;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
    this.carriageId = '';
    this.option = null;
    this.merryMenSpaceId = '';
  }

  onEnteringState(args: OnEnteringEventMaidMarianDarkStateArgs) {
    debug('Entering EventMaidMarianDarkState');
    this.args = args;
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving EventMaidMarianDarkState');
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
    if (this.args._private.carriages.length === 1) {
      this.carriageId = this.args._private.carriages[0].id;
      this.updateInterfaceSelectParish();
      return;
    }
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _(
        '${you} must select a Carriage to remove to the Used Carriages box'
      ),
      args: {
        you: '${you}',
      },
    });

    this.args._private.carriages.forEach((carriage) => {
      this.game.setElementSelectable({
        id: carriage.id,
        callback: () => {
          this.carriageId = carriage.id;
          this.updateInterfaceSelectParish();
        },
      });
    });

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectParish() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Parish to set to Submissive'),
      args: {
        you: '${you}',
      },
    });

    this.args._private.spaces.forEach((option) => {
      const space = option.space;
      this.game.setSpaceSelectable({
        id: space.id,
        callback: () => {
          this.option = option;
          if (option.hasMerryMen) {
            this.updateInterfaceSelectMerrySpace();
          } else {
            this.updateInterfaceConfirm();
          }
        },
      });
    });
    this.game.setElementSelected({ id: this.carriageId });

    this.game.addCancelButton();
  }

  private updateInterfaceSelectMerrySpace() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _(
        '${you} must select a space to move all Merry Men in ${spaceName} to'
      ),
      args: {
        you: '${you}',
        spaceName: _(this.option.space.name),
      },
    });

    this.option.adjacentSpacesIds.forEach((id) => {
      const space = this.game.gamedatas.spaces[id];
      this.game.setSpaceSelectable({
        id: space.id,
        callback: () => {
          this.merryMenSpaceId = space.id;
          this.updateInterfaceConfirm();
        },
      });
    });
    this.game.setElementSelected({ id: this.carriageId });
    this.game.gameMap.forces[`${MERRY_MEN}_${this.option.space.id}`]
      .getCards()
      .forEach(({ id }) => this.game.setElementSelected({ id }));

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    let text = _(
      'Remove Carriage, set ${spaceName} to Submissive and move Merry Men to ${spaceNameMerryMen}?'
    );
    if (!this.merryMenSpaceId) {
      text = _('Remove Carriage and set ${spaceName} to Submissive?');
    }

    this.game.setElementSelected({ id: this.carriageId });
    if (this.merryMenSpaceId) {
      this.game.gameMap.forces[`${MERRY_MEN}_${this.option.space.id}`]
      .getCards()
      .forEach(({ id }) => this.game.setElementSelected({ id }));
    }

    this.game.clientUpdatePageTitle({
      text,
      args: {
        spaceName: _(this.option.space.name),
        spaceNameMerryMen: this.merryMenSpaceId
          ? _(this.game.gamedatas.spaces[this.merryMenSpaceId].name)
          : '',
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actEventMaidMarianDark',
        args: {
          carriageId: this.carriageId,
          spaceId: this.option.space.id,
          merryMenSpaceId: this.merryMenSpaceId || null,
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
