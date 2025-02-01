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
  protected playerId: number;
  private playerName: string;

  public playerData: AGestOfRobinHoodPlayerData;
  private side: 'RobinHood' | 'Sheriff';

  public counters: {
    shillings?: IconCounter;
    RobinHood: {
      Camp?: IconCounter;
      MerryMen?: IconCounter;
      RobinHood?: IconCounter;
    };
    Sheriff: {
      Carriage?: IconCounter;
      TallageCarriage?: IconCounter;
      TributeCarriage?: IconCounter;
      TrapCarriage?: IconCounter;
      Henchmen?: IconCounter;
    };
  } = {
    RobinHood: {},
    Sheriff: {},
  };

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
    this.side = player.side;
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

  updatePlayer({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    this.updatePlayerPanel({
      playerGamedatas: gamedatas.players[this.playerId],
    });
    if (this.side === 'RobinHood') {
      this.updateRobinHoodIconCounters({ gamedatas });
    } else if (this.side === 'Sheriff') {
      this.updateSheriffIconCounters({ gamedatas });
    }
  }

  updateRobinHoodIconCounters({
    gamedatas,
  }: {
    gamedatas: AGestOfRobinHoodGamedatas;
  }) {
    if (this.playerId !== this.game.getPlayerId()) {
      this.counters.RobinHood[CAMP].setValue(gamedatas.forces.supply.Camp);
      this.counters.RobinHood[MERRY_MEN].setValue(
        gamedatas.forces.supply.MerryMen
      );
    }
  }

  updateRobinHoodIconCountersPrivate({
    Camp,
    MerryMen,
    RobinHood,
  }: {
    Camp: number;
    MerryMen: number;
    RobinHood: number;
  }) {
    this.counters.RobinHood[CAMP].setValue(Camp);
    this.counters.RobinHood[MERRY_MEN].setValue(MerryMen);
    this.counters.RobinHood[ROBIN_HOOD].setValue(RobinHood);
  }

  updateSheriffIconCounters({
    gamedatas,
  }: {
    gamedatas: AGestOfRobinHoodGamedatas;
  }) {
    if (this.playerId !== this.game.getPlayerId()) {
      this.counters.Sheriff[CARRIAGE].setValue(
        gamedatas.forces.supply.Carriage
      );
      this.counters.Sheriff[HENCHMEN].setValue(
        gamedatas.forces.supply.Henchmen
      );
    }
  }

  updateSheriffIconCountersPrivate({
    Henchmen,
    TallageCarriage,
    TributeCarriage,
    TrapCarriage,
  }: {
    Henchmen: number;
    TallageCarriage: number;
    TributeCarriage: number;
    TrapCarriage: number;
  }) {
    this.counters.Sheriff[TALLAGE_CARRIAGE].setValue(TallageCarriage);
    this.counters.Sheriff[TRIBUTE_CARRIAGE].setValue(TributeCarriage);
    this.counters.Sheriff[TRAP_CARRIAGE].setValue(TrapCarriage);
    this.counters.Sheriff[HENCHMEN].setValue(Henchmen);
  }

  // Setup functions
  setupPlayer({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    this.setupPlayerPanel({ gamedatas });
  }

  setupRobinHoodIconCounters({
    gamedatas,
  }: {
    gamedatas: AGestOfRobinHoodGamedatas;
  }) {
    if (this.playerId === this.game.getPlayerId()) {
      this.counters.RobinHood[CAMP] = new IconCounter({
        containerId: `gest_player_panel_${this.playerId}`,
        extraIconClasses: 'gest_force_side',
        icon: 'camp',
        iconCounterId: `gest_camps_counter_${this.playerId}`,
        initialValue: gamedatas.robinHoodForces?.supply.Camp || 0,
        dataAttributes: [
          {
            key: 'data-revealed',
            value: 'true',
          },
          {
            key: 'data-type',
            value: CAMP,
          },
        ],
      });
      this.counters.RobinHood[MERRY_MEN] = new IconCounter({
        containerId: `gest_player_panel_${this.playerId}`,
        extraIconClasses: 'gest_force_side',
        icon: '',
        iconCounterId: `gest_merryMen_counter_${this.playerId}`,
        initialValue: gamedatas.robinHoodForces?.supply.MerryMen || 0,
        dataAttributes: [
          {
            key: 'data-revealed',
            value: 'true',
          },
          {
            key: 'data-type',
            value: MERRY_MEN,
          },
        ],
      });
      this.counters.RobinHood[ROBIN_HOOD] = new IconCounter({
        containerId: `gest_player_panel_${this.playerId}`,
        extraIconClasses: 'gest_force_side',
        icon: '',
        iconCounterId: `gest_RobinHood_counter_${this.playerId}`,
        initialValue: gamedatas.robinHoodForces?.supply.RobinHood || 0,
        dataAttributes: [
          {
            key: 'data-revealed',
            value: 'true',
          },
          {
            key: 'data-type',
            value: ROBIN_HOOD,
          },
        ],
      });
    } else {
      this.counters.RobinHood[CAMP] = new IconCounter({
        containerId: `gest_player_panel_${this.playerId}`,
        extraIconClasses: 'gest_force_side',
        icon: 'camp',
        iconCounterId: `gest_camps_counter_${this.playerId}`,
        initialValue: gamedatas.forces.supply.Camp,
        dataAttributes: [
          {
            key: 'data-revealed',
            value: 'false',
          },
          {
            key: 'data-type',
            value: CAMP,
          },
        ],
      });
      this.counters.RobinHood[MERRY_MEN] = new IconCounter({
        containerId: `gest_player_panel_${this.playerId}`,
        extraIconClasses: 'gest_force_side',
        icon: '',
        iconCounterId: `gest_merryMen_counter_${this.playerId}`,
        initialValue: gamedatas.forces.supply.MerryMen,
        dataAttributes: [
          {
            key: 'data-revealed',
            value: 'false',
          },
          {
            key: 'data-type',
            value: MERRY_MEN,
          },
        ],
      });
    }
  }

  setupSheriffIconCounters({
    gamedatas,
  }: {
    gamedatas: AGestOfRobinHoodGamedatas;
  }) {
    if (this.playerId === this.game.getPlayerId()) {
      this.counters.Sheriff[TALLAGE_CARRIAGE] = new IconCounter({
        containerId: `gest_player_panel_${this.playerId}`,
        extraIconClasses: 'gest_force_side',
        icon: '',
        iconCounterId: `gest_tallageCarriage_counter_${this.playerId}`,
        initialValue: gamedatas.sheriffForces?.supply.TallageCarriage || 0,
        dataAttributes: [
          {
            key: 'data-revealed',
            value: 'true',
          },
          {
            key: 'data-type',
            value: TALLAGE_CARRIAGE,
          },
        ],
      });
      this.game.tooltipManager.addCarriageTooltip({
        nodeId: `gest_tallageCarriage_counter_${this.playerId}`,
        type: TALLAGE_CARRIAGE,
      });
      this.counters.Sheriff[TRIBUTE_CARRIAGE] = new IconCounter({
        containerId: `gest_player_panel_${this.playerId}`,
        extraIconClasses: 'gest_force_side',
        icon: '',
        iconCounterId: `gest_tributeCarriage_counter_${this.playerId}`,
        initialValue: gamedatas.sheriffForces?.supply.TributeCarriage || 0,
        dataAttributes: [
          {
            key: 'data-revealed',
            value: 'true',
          },
          {
            key: 'data-type',
            value: TRIBUTE_CARRIAGE,
          },
        ],
      });
      this.game.tooltipManager.addCarriageTooltip({
        nodeId: `gest_tributeCarriage_counter_${this.playerId}`,
        type: TRIBUTE_CARRIAGE,
      });
      this.counters.Sheriff[TRAP_CARRIAGE] = new IconCounter({
        containerId: `gest_player_panel_${this.playerId}`,
        extraIconClasses: 'gest_force_side',
        icon: '',
        iconCounterId: `gest_trapCarriage_counter_${this.playerId}`,
        initialValue: gamedatas.sheriffForces?.supply.TrapCarriage || 0,
        dataAttributes: [
          {
            key: 'data-revealed',
            value: 'true',
          },
          {
            key: 'data-type',
            value: TRAP_CARRIAGE,
          },
        ],
      });
      this.game.tooltipManager.addCarriageTooltip({
        nodeId: `gest_trapCarriage_counter_${this.playerId}`,
        type: TRAP_CARRIAGE,
      });
      this.counters.Sheriff[HENCHMEN] = new IconCounter({
        containerId: `gest_player_panel_${this.playerId}`,
        extraIconClasses: 'gest_force_side',
        icon: '',
        iconCounterId: `gest_henchmen_counter_${this.playerId}`,
        initialValue: gamedatas.sheriffForces?.supply.Henchmen || 0,
        dataAttributes: [
          {
            key: 'data-revealed',
            value: 'true',
          },
          {
            key: 'data-type',
            value: HENCHMEN,
          },
        ],
      });
    } else {
      this.counters.Sheriff[CARRIAGE] = new IconCounter({
        containerId: `gest_player_panel_${this.playerId}`,
        extraIconClasses: 'gest_force_side',
        icon: '',
        iconCounterId: `gest_carriage_counter_${this.playerId}`,
        initialValue: gamedatas.forces.supply.Carriage,
        dataAttributes: [
          {
            key: 'data-revealed',
            value: 'false',
          },
          {
            key: 'data-type',
            value: CARRIAGE,
          },
        ],
      });
      this.counters.Sheriff[HENCHMEN] = new IconCounter({
        containerId: `gest_player_panel_${this.playerId}`,
        extraIconClasses: 'gest_force_side',
        icon: '',
        iconCounterId: `gest_henchmen_counter_${this.playerId}`,
        initialValue: gamedatas.forces.supply.Henchmen,
        dataAttributes: [
          {
            key: 'data-revealed',
            value: 'true',
          },
          {
            key: 'data-type',
            value: HENCHMEN,
          },
        ],
      });
    }
  }

  setupPlayerPanel({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    const playerGamedatas = gamedatas.players[this.playerId];

    const playerBoardDiv = document.getElementById(
      `player_board_${this.playerId}`
    );
    playerBoardDiv.insertAdjacentHTML(
      'beforeend',
      tplPlayerPanel({ playerId: this.playerId })
    );

    this.counters.shillings = new IconCounter({
      containerId: `gest_player_panel_${this.playerId}`,
      icon: 'shilling',
      iconCounterId: `gest_shillings_counter_${this.playerId}`,
      initialValue: playerGamedatas.shillings,
    });
    // .create(`shillings_counter_${this.playerId}`);
    if (this.side === 'RobinHood') {
      this.setupRobinHoodIconCounters({ gamedatas });
    } else if (this.side === 'Sheriff') {
      this.setupSheriffIconCounters({ gamedatas });
    }

    this.updatePlayerPanel({ playerGamedatas });
  }

  updatePlayerPanel({
    playerGamedatas,
  }: {
    playerGamedatas: AGestOfRobinHoodPlayerData;
  }) {
    if (this.game.framework().scoreCtrl?.[this.playerId]) {
      this.game
        .framework()
        .scoreCtrl[this.playerId].setValue(Number(playerGamedatas.score));
    }

    this.counters.shillings.setValue(playerGamedatas.shillings);
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

  isRobinHood(): boolean {
    return this.side === 'RobinHood';
  }

  isSheriff(): boolean {
    return this.side === 'Sheriff';
  }

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.
}
