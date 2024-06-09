class DisperseState implements State {
  private game: AGestOfRobinHoodGame;
  private args: OnEnteringDisperseStateArgs;
  private selectedOption: DisperseOption | null;
  private publicForcesCamps: GestForce[];
  private publicForcesMerryMen: GestForce[];
  private selectedCamps: GestForce[];
  private selectedMerryMen: GestForce[];

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringDisperseStateArgs) {
    debug('Entering DisperseState');
    this.args = args;
    this.selectedOption = null;
    this.publicForcesCamps = [];
    this.publicForcesMerryMen = [];
    this.selectedCamps = [];
    this.selectedMerryMen = [];
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving DisperseState');
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

    // if (Object.keys(this.args.options).length === 1) {
    //   this.selectedOption = Object.values(this.args.options)[0];
    //   this.selectPublicForces();
    //   this.updateInterfaceSelectMerryMenAndCamps();
    // }

    this.game.clientUpdatePageTitle({
      text: _('${you} must select a Parish to Disperse in'),
      args: {
        you: '${you}',
      },
    });

    Object.entries(this.args.options).forEach(([spaceId, option]) =>
      this.game.addPrimaryActionButton({
        id: `${spaceId}_btn`,
        text: _(option.space.name),
        callback: () => {
          this.selectedOption = option;
          this.selectPublicForces();
          this.updateInterfaceSelectMerryMenAndCamps();
        },
      })
    );

    this.game.addPassButton({
      optionalAction: this.args.optionalAction,
    });
    this.game.addUndoButtons(this.args);
  }

  private updateInterfaceSelectMerryMenAndCamps() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: _('${you} may select up to two pieces to remove'),
      args: {
        you: '${you}',
      },
    });

    this.setMerryMenSelectable();

    // No Merry Men remain
    if (this.selectedMerryMen.length === this.publicForcesMerryMen.length) {
      this.setCampsSelectable();
    }

    this.game.addPrimaryActionButton({
      id: 'done_btn',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm(),
      extraClasses:
        this.selectedMerryMen.length + this.selectedCamps.length === 0
          ? DISABLED
          : '',
    });

    this.game.addCancelButton();
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();

    this.selectedCamps.forEach((camp) =>
      this.game.setElementSelected({ id: camp.id })
    );
    this.selectedMerryMen.forEach((merryMan) =>
      this.game.setElementSelected({ id: merryMan.id })
    );

    this.game.clientUpdatePageTitle({
      text: _('Dispers in ${spaceName}?'),
      args: {
        spaceName: _(this.selectedOption.space.name),
        // carriageType: carriageType,
      },
    });

    const callback = () => {
      this.game.clearPossible();
      this.game.takeAction({
        action: 'actDisperse',
        args: {
          spaceId: this.selectedOption.space.id,
          camps: this.selectedCamps.map((camp) => ({
            type: camp.type,
            hidden: camp.hidden,
          })),
          merryMen: this.selectedMerryMen.map((merryMan) => ({
            type: merryMan.type,
            hidden: merryMan.hidden,
          })),
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

  private selectPublicForces() {
    this.selectedOption.merryMen.forEach(({ type, hidden }: DisperseTarget) => {
      const merryMan = this.game.gameMap.getForcePublic({
        type,
        hidden,
        spaceId: this.selectedOption.space.id,
        exclude: this.publicForcesMerryMen,
      });
      this.publicForcesMerryMen.push(merryMan);
    });
    console.log('optionCamps', this.selectedOption.camps);
    this.selectedOption.camps.forEach(({ type, hidden }: DisperseTarget) => {
      const camp = this.game.gameMap.getForcePublic({
        type,
        hidden,
        spaceId: this.selectedOption.space.id,
        exclude: this.publicForcesCamps,
      });
      console.log('camp', camp);
      this.publicForcesCamps.push(camp);
    });
  }

  private setCampsSelectable() {
    this.selectedCamps.forEach((camp) => {
      this.game.setElementSelected({ id: camp.id });
      this.game.setElementSelectable({
        id: camp.id,
        callback: () => {
          this.selectedCamps = this.selectedCamps.filter(
            (selected) => selected.id !== camp.id
          );
          this.updateInterfaceSelectMerryMenAndCamps();
        },
      });
    });
    this.publicForcesCamps
      .filter(
        (publicForce) =>
          !this.selectedCamps.some((camp) => camp.id === publicForce.id)
      )
      .forEach((camp) => {
        this.game.setElementSelectable({
          id: camp.id,
          callback: () => {
            this.selectedCamps.push(camp);
            this.updateInterfaceSelectMerryMenAndCamps();
          },
        });
      });
  }

  private setMerryMenSelectable() {
    this.selectedMerryMen.forEach((merryMan) => {
      this.game.setElementSelected({ id: merryMan.id });
      this.game.setElementSelectable({
        id: merryMan.id,
        callback: () => {
          this.selectedMerryMen = this.selectedMerryMen.filter(
            (selected) => selected.id !== merryMan.id
          );
          this.selectedCamps = [];
          this.updateInterfaceSelectMerryMenAndCamps();
        },
      });
    });
    this.publicForcesMerryMen
      .filter(
        (publicForce) =>
          !this.selectedMerryMen.some(
            (merryMan) => merryMan.id === publicForce.id
          )
      )
      .forEach((merryMan) => {
        this.game.setElementSelectable({
          id: merryMan.id,
          callback: () => {
            this.selectedMerryMen.push(merryMan);
            this.updateInterfaceSelectMerryMenAndCamps();
          },
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

  // private handlePieceClick();
}
