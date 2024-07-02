//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##

//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##

class PlayerManager {
  private game: AGestOfRobinHoodGame;
  private players: Record<number, GestPlayer>;

  constructor(game: AGestOfRobinHoodGame) {
    console.log('Constructor PlayerManager');
    this.game = game;
    this.players = {};

    for (const playerId in game.gamedatas.players) {
      const player = game.gamedatas.players[playerId];
      this.players[playerId] = new GestPlayer({ player, game: this.game });
    }
  }

  getPlayer({ playerId }: { playerId: number }): GestPlayer {
    return this.players[playerId];
  }

  getPlayers(): GestPlayer[] {
    return Object.values(this.players);
  }

  getPlayerIds(): number[] {
    return Object.keys(this.players).map(Number);
  }

  getRobinHoodPlayer() {
    return Object.values(this.players).filter((player) =>
      player.isRobinHood()
    )[0];
  }

  getRobinHoodPlayerId() {
    return Object.values(this.players)
      .filter((player) => player.isRobinHood())[0]
      .getPlayerId();
  }

  getSheriffPlayer() {
    return Object.values(this.players).filter(
      (player) => !player.isRobinHood()
    )[0];
  }

  getSheriffPlayerId() {
    return Object.values(this.players)
      .filter((player) => !player.isRobinHood())[0]
      .getPlayerId();
  }

  updatePlayers({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    for (const playerId in gamedatas.players) {
      this.players[playerId].updatePlayer({ gamedatas });
    }
  }

  clearInterface() {
    Object.keys(this.players).forEach((playerId) => {
      this.players[playerId].clearInterface();
    });
  }
}
