class MoveForcesState {
  protected game: AGestOfRobinHoodGame;
  protected localMoves: Record<string, (GestForce & { fromHidden: boolean })[]>;

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
    fromHidden,
    force,
  }: {
    fromSpaceId: string;
    fromHidden: boolean;
    force: GestForce;
  }) {
    if (this.localMoves[fromSpaceId]) {
      this.localMoves[fromSpaceId].push({ ...force, fromHidden });
    } else {
      this.localMoves[fromSpaceId] = [{ ...force, fromHidden }];
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
      const forcesToMove: GestForce[] = [];
      forces.forEach(({ fromHidden, ...force }) => {
        const originalForce = {
          ...force,
          hidden: fromHidden,
          location: spaceId,
        };
        if (spaceId.endsWith('supply')) {
          promises.push(this.game.forceManager.removeCard(originalForce));
        } else {
          forcesToMove.push(originalForce);
        }
      });
      if (forcesToMove.length > 0) {
        promises.push(
          this.game.gameMap.forces[`${MERRY_MEN}_${spaceId}`].addCards(
            forcesToMove
          )
        );
      }
    });

    await Promise.all(promises);
  }
}
