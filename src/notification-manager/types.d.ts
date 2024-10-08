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

interface NotifRefreshForcesPrivate extends NotifWithPlayerArgs {
  forces: Record<string, GestForce[]> & {
    supply: {
      Camp?: number;
      MerryMen?: number;
      RobinHood?: number;
      Henchmen?: number;
      TallageCarriage?: number;
      TrapCarriage?: number;
      TributeCarriage?: number;
    };
  };
}

interface NotifClearTurnArgs extends NotifWithPlayerArgs {
  notifIds: string[];
}

interface NotifPlaceBridgeArgs {
  borderId: string;
}

// type NotifSmallRefreshInterfaceArgs = Omit<
//   AGestOfRobinHoodGamedatas,
//   'staticData'
// >;
interface NotifCaptureMerryMenArgs {
  capturedPieces: {
    force: GestForce;
    type: string;
    hidden: boolean;
    spaceId: string;
  }[];
}

interface NotifChooseActionArgs {
  marker: GestMarker;
}

interface NotifDrawAndRevealCardArgs {
  card: GestCard;
}

interface NotifDrawAndRevealTravellerCardArgs {
  card: GestCard;
}

interface NotifGainShillingsArgs extends NotifWithPlayerArgs {
  amount: number;
}

interface NotifHideForceArgs extends NotifWithPlayerArgs {
  force: GestForce;
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

interface NotifMoveForcesArgs extends NotifWithPlayerArgs {
  forces: GestForce[];
  type: string;
  toSpaceId: string;
}

interface NotifMoveCarriagePrivateArgs extends NotifWithPlayerArgs {
  carriage: GestForce;
  henchman: GestForce | null;
  toSpaceId: string;
}

interface NotifMoveCarriagePublicArgs extends NotifWithPlayerArgs {
  // carriage: GestForce;
  // fromSpaceId: string;
  // toSpaceId: string;
  carriage: {
    hidden: boolean;
    type: string | null;
  };
  henchman: GestForce | null;
  fromSpaceId: string;
  toSpaceId: string;
}

interface NotifMoveRoyalFavourMarkerArgs extends NotifWithPlayerArgs {
  marker: GestMarker;
  scores: Record<string, number>;
}

interface NotifMoveRoyalInspectionMarkerArgs extends NotifWithPlayerArgs {
  marker: GestMarker;
}

interface NotifPassActionArgs extends NotifWithPlayerArgs {
  amount: number;
}

interface NotifParishStatusArgs extends NotifWithPlayerArgs {
  status: string;
  spaceId: string;
}

interface NotifPayShillingsArgs extends NotifWithPlayerArgs {
  amount: number;
}

interface NotifPlaceCardInTravellersDeckArgs extends NotifWithPlayerArgs {
  card: GestTravellerCard;
}

interface NotifPlaceForceArgs extends NotifWithPlayerArgs {
  force: {
    type: string;
    hidden: boolean;
  };
  spaceId: string;
  count: number;
}

type NotifPlaceForceAllArgs = NotifPlaceForcePrivateArgs;

interface NotifPlaceForcePrivateArgs extends NotifWithPlayerArgs {
  forces: GestForce[];
}

interface NotifPlaceMerryMenArgs extends NotifWithPlayerArgs {
  merryMenCounts: Record<string, number>;
}

interface NotifPlaceMerryMenPrivateArgs extends NotifWithPlayerArgs {
  robinHood: GestForce | null;
  merryMen: GestForce[];
}

interface NotifPutCardInVictimsPileArgs {
  card: GestTravellerCard
  fromLocation: string;
}

interface NotifPutTravellerInDiscardPileArgs {
  card: GestTravellerCard;
}

interface NotifRedeploymentSheriffArgs {
  forces: GestForce[];
  carriages: GestForce[];
  isTemporaryTruce: boolean;
}

interface NotifRemoveCardFromGameArgs {
  card: GestTravellerCard;
  fromLocation: string;
}

interface NotifRevealCarriageArgs extends NotifWithPlayerArgs {
  carriage: GestForce;
}

interface NotifHideForceArgs extends NotifWithPlayerArgs {
  force: GestForce;
}

interface NotifRevealForceArgs extends NotifWithPlayerArgs {
  force: GestForce;
}

interface NotifReturnToSupplyArgs extends NotifWithPlayerArgs {
  force: {
    type: string;
    hidden: boolean;
  };
  spaceId: string;
}

interface NotifReturnToSupplyPrivateArgs extends NotifWithPlayerArgs {
  force: GestForce;
}

interface NotifRevoltArgs extends NotifWithPlayerArgs {
  spaceId: string;
}

interface NotifReturnTravellersDiscardToMainDeckArgs {
  cards: GestTravellerCard[];
}

interface NotifRobTakeTwoShillingsFromTheSheriffArgs {
  playerId: number;
  sheriffPlayerId: number;
  amount: number;
}

interface NotifSneakMerryMenArgs extends NotifWithPlayerArgs {
  moves: {
    hide: number;
    reveal: number;
    noChange: {
      hidden: number;
      revealed: number;
    };
    robinHood: string;
  };
  fromSpaceId: string;
  toSpaceId: string;
}

interface NotifSneakMerryMenPrivateArgs extends NotifWithPlayerArgs {
  forces: GestForce[];
  toSpaceId: string;
}

interface NotifMoveMerryMenPrivateArgs extends NotifWithPlayerArgs {
  forces: GestForce[];
}

interface MerryManMovePublic {
  from: {
    hidden: boolean;
    spaceId: string;
    type: 'MerryMen' | 'RobinHood';
  };
  to: {
    hidden: boolean;
    spaceId: string;
    type: 'MerryMen' | 'RobinHood';
  };
}

interface NotifMoveMerryMenPublicArgs extends NotifWithPlayerArgs {
  moves: MerryManMovePublic[];
}

interface NotifStartOfRoundArgs {
  balladNumber: number;
  eventNumber: number;
}
