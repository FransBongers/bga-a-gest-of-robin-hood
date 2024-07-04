interface AddButtonProps {
  id: string;
  text: string;
  callback: () => void;
  extraClasses?: string;
}

interface AddActionButtonProps extends AddButtonProps {
  color?: 'blue' | 'gray' | 'red' | 'none';
}

interface AGestOfRobinHoodGame extends Game {
  addCancelButton: ({ callback }?: { callback?: Function }) => void;
  addConfirmButton: (props: { callback: Function | string }) => void;
  addLogClass: () => void;
  addPassButton: (props: { optionalAction: boolean; text?: string }) => void;
  addPlayerButton: ({
    player,
    callback,
  }: {
    player: BgaPlayer;
    callback: Function | string;
  }) => void;
  addPrimaryActionButton: (props: AddButtonProps) => void;
  addSecondaryActionButton: (props: AddButtonProps) => void;
  addDangerActionButton: (props: AddButtonProps) => void;
  addUndoButtons: (props: CommonArgs) => void;
  cancelLogs: (notifIds: string[]) => void;
  clearInterface: () => void;
  clearPossible: () => void;
  clientUpdatePageTitle: (props: {
    text: string;
    args: Record<string, unknown>;
    nonActivePlayers?: boolean;
  }) => void;
  format_string_recursive: (
    log: string,
    args: Record<string, unknown>
  ) => string;
  getPlayerId: () => number;
  getStaticCardData: ({ cardId }: { cardId: string }) => GestCardStaticData;
  onCancel: () => void;
  setCardSelectable: (props: {
    id: string;
    callback: (event: PointerEvent) => void;
  }) => void;
  setCardSelected: (props: { id: string }) => void;
  setLocationSelectable: (props: {
    id: string;
    callback: (event: PointerEvent) => void;
  }) => void;
  setLocationSelected: (props: { id: string }) => void;
  setSpaceSelectable: (props: {
    id: string;
    callback: (event: PointerEvent) => void;
  }) => void;
  setSpaceSelected: (props: { id: string }) => void;
  setElementSelectable: (props: {
    id: string;
    callback: (event: PointerEvent) => void;
  }) => void;
  setElementSelected: (props: { id: string }) => void;
  removeSelectedFromElement: (props: { id: string }) => void;
  takeAction: (props: {
    action: string;
    atomicAction?: boolean;
    args?: Record<string, unknown>;
    checkAction?: string; // Action used in checkAction
  }) => void;
  updateLayout: () => void;
  updateLogTooltips: () => void;
  animationManager: AnimationManager;
  gameMap: GameMap;
  infoPanel: InfoPanel;
  cardArea: CardArea;
  cardManager: GestCardManager;
  forceManager: ForceManager;
  markerManager: MarkerManager;
  notificationManager: NotificationManager;
  playerManager: PlayerManager;
  settings: Settings;
  tooltipManager: TooltipManager;
  _last_tooltip_id: number; // generic
  tooltipsToMap: [tooltipId: number, card_id: string][]; // generic
}

interface GestCardStaticData {
  carriageMoves: number;
  eventType: 'regularEvent' | 'fortuneEvent' | 'royalInspection' | null;
  id: string;
  setupLocation: string;
  strength: number;
  textDark: string;
  textLight: string;
  title: string;
  titleDark: string;
  titleLight: string;
  type: 'eventCard' | 'travellerCard';
}

interface GestCard {
  id: string;
  location: string;
  title: string;
}

interface GestForce {
  id: string;
  location: string;
  hidden: boolean;
  type: string;
}

interface GestMarker {
  id: string;
  location: string;
  side: 'front' | 'back';
  type: string;
}

interface GestSpace {
  id: string;
  location: string;
  status: 'submissive' | 'revolting' | 'passive';
  name: string;
}

interface AGestOfRobinHoodGamedatas extends Gamedatas {
  // Default
  canceledNotifIds: string[];
  playerOrder: number[];
  players: Record<number, AGestOfRobinHoodPlayerData>;
  // Game specific
  ballad: {
    balladNumber: number;
    eventNumber: number;
  };
  bridgeLocation: string;
  cards: {
    eventsDiscard: GestCard | null;
    travellersDiscard: GestCard | null;
    travellersVictimsPile: GestCard | null;
  };
  forces: Record<
    string,
    {
      Camp: {
        hidden: number;
        revealed: number;
      };
      Carriage: {
        hidden: number;
        TallageCarriage: number;
        TrapCarriage: number;
        TributeCarriage: number;
      };
      Henchmen: GestForce[];
      MerryMen: {
        hidden: number;
        revealed: number;
      };
      RobinHood: number;
    }
  > & {
    supply: {
      Camp: number;
      Carriage: number;
      Henchmen: number;
      MerryMen: number;
    };
  };
  markers: Record<string, GestMarker>;
  robinHoodForces?: Record<string, GestForce[]> & {
    supply: {
      Camp: number;
      MerryMen: number;
      RobinHood: number;
    };
  };
  sheriffForces?: Record<string, GestForce[]> & {
    supply: {
      Henchmen: number;
      TallageCarriage: number;
      TrapCarriage: number;
      TributeCarriage: number;
    };
  };
  spaces: Record<string, GestSpace>;
  staticData: {
    cards: Record<string, GestCardStaticData>;
  };
}

interface AGestOfRobinHoodPlayerData extends BgaPlayer {
  shillings: number;
  side: 'RobinHood' | 'Sheriff';
}
