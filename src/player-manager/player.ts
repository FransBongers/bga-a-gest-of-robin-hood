//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##

class GestPlayer {
  protected game: AGestOfRobinHoodGame;
  protected playerColor: string;
  private playerHexColor: string;
  protected playerId: number;
  private playerName: string;

  public playerData: AGestOfRobinHoodPlayerData;

  constructor({
    game,
    player,
  }: {
    game: AGestOfRobinHoodGame;
    player: AGestOfRobinHoodPlayerData;
  }) {
    // console.log("Player", player);
    this.game = game;
    const playerId = player.id;
    this.playerId = Number(playerId);
    this.playerData = player;
    this.playerName = player.name;
    this.playerColor = player.color;
    // this.playerHexColor = player.hexColor;
    const gamedatas = game.gamedatas;

    // if (this.playerId === this.game.getPlayerId()) {
    //   dojo.place(tplPlayerHand({ playerId: this.playerId, playerName: this.playerName }), 'pp_player_tableaus', 1);
    // }

    this.setupPlayer({ gamedatas });
  }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  updatePlayer({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {}

  // Setup functions
  setupPlayer({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    const playerGamedatas = gamedatas.players[this.playerId];

    this.setupPlayerPanel({ playerGamedatas });
    this.setupHand({ playerGamedatas });
  }

  setupHand({
    playerGamedatas,
  }: {
    playerGamedatas: AGestOfRobinHoodPlayerData;
  }) {

  }

  setupPlayerPanel({
    playerGamedatas,
  }: {
    playerGamedatas: AGestOfRobinHoodPlayerData;
  }) {
    this.updatePlayerPanel({ playerGamedatas });
  }

  updatePlayerPanel({ playerGamedatas }: { playerGamedatas: BgaPlayer }) {
    if (this.game.framework().scoreCtrl?.[this.playerId]) {
      this.game
        .framework()
        .scoreCtrl[this.playerId].setValue(Number(playerGamedatas.score));
    }
  }

  clearInterface() {}

  // ..######...########.########.########.########.########...######.
  // .##....##..##..........##.......##....##.......##.....##.##....##
  // .##........##..........##.......##....##.......##.....##.##......
  // .##...####.######......##.......##....######...########...######.
  // .##....##..##..........##.......##....##.......##...##.........##
  // .##....##..##..........##.......##....##.......##....##..##....##
  // ..######...########....##.......##....########.##.....##..######.

  // ..######..########.########.########.########.########...######.
  // .##....##.##..........##.......##....##.......##.....##.##....##
  // .##.......##..........##.......##....##.......##.....##.##......
  // ..######..######......##.......##....######...########...######.
  // .......##.##..........##.......##....##.......##...##.........##
  // .##....##.##..........##.......##....##.......##....##..##....##
  // ..######..########....##.......##....########.##.....##..######.

  getColor(): string {
    return this.playerColor;
  }

  getHexColor(): string {
    return this.playerHexColor;
  }

  getName(): string {
    return this.playerName;
  }

  getPlayerId(): number {
    return this.playerId;
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.
}