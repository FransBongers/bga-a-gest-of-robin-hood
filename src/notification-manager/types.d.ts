/**
 * Note: we need to keep player_name in snake case, because the framework uses
 * it to add player colors to the log messages.
 */

interface Log {
  log: string;
  args: Record<string, unknown>;
}

interface NotifWithPlayerArgs {
  playerId: number;
  player_name: string;
}

interface NotifRefreshUIArgs {
  datas: AGestOfRobinHoodGamedatas;
}

// type NotifSmallRefreshInterfaceArgs = Omit<
//   AGestOfRobinHoodGamedatas,
//   'staticData'
// >;

interface NotifSetupRobinHoodArgs extends NotifWithPlayerArgs {
  merryMenCounts: {
    Remston: number;
    ShireWood: number;
    SouthwellForest: number;
  }
}

interface NotifSetupRobinHoodPrivateArgs extends NotifWithPlayerArgs {
  robinHood: GestForce;
  merryMen: GestForce[];
}