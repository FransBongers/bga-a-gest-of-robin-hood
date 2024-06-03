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
interface NotifChooseActionArgs {
  marker: GestMarker;
}

interface NotifDrawAndRevealCardArgs {
  card: GestCard;
}

interface NotifGainShillingsArgs extends NotifWithPlayerArgs {
  amount: number;
}

interface NotifMoveCarriageArgs extends NotifWithPlayerArgs {
  carriage: {
    hidden: boolean;
    type: string | null;
  };
  henchman: GestForce | null;
  fromSpaceId: string;
  toSpaceId: string;
}


interface NotifMoveCarriagePrivateArgs extends NotifWithPlayerArgs {
  carriage: GestForce;
  henchman: GestForce | null;
  toSpaceId: string;
}

interface NotifMoveCarriagePublicArgs extends NotifWithPlayerArgs {
  carriage: GestForce;
  fromSpaceId: string;
  toSpaceId: string;
}

interface NotifMoveRoyalFavourMarkerArgs extends NotifWithPlayerArgs {
  marker: GestMarker;
}

interface NotifRevealCarriageArgs extends NotifWithPlayerArgs {
  carriage: GestForce;
}

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