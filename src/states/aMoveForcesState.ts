class MoveForcesState {
  protected game: AGestOfRobinHoodGame;
  protected localMoves: Record<string, GestForce[]>;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
    this.localMoves = {};
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  protected addLocalMove({
    fromSpaceId,
    force,
  }: {
    fromSpaceId: string;
    force: GestForce;
  }) {
    if (this.localMoves[fromSpaceId]) {
      this.localMoves[fromSpaceId].push(force);
    } else {
      this.localMoves[fromSpaceId] = [force];
    }
  }

  protected addCancelButton() {
    this.game.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: async () => {
        await this.revertLocalMoves();
        this.game.onCancel();
      },
    });
  }

  protected async revertLocalMoves() {
    const promises = [];

    Object.entries(this.localMoves).forEach(([spaceId, forces]) => {
      promises.push(
        this.game.gameMap.forces[`${MERRY_MEN}_${spaceId}`].addCards(
          forces.map((force) => {
            return {
              ...force,
              location: spaceId,
            };
          })
        )
      );
    });

    await Promise.all(promises);
  }
}
