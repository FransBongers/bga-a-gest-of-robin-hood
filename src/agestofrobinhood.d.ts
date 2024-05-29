interface AddButtonProps {
  id: string;
  text: string;
  callback: () => void;
  extraClasses?: string;
}

interface AddActionButtonProps extends AddButtonProps {
  color?: "blue" | "gray" | "red" | "none";
}

interface AGestOfRobinHoodGame extends Game {
  addCancelButton: ({ callback }?: { callback?: Function }) => void;
  addConfirmButton: (props: { callback: Function | string }) => void;
  addPassButton: (props: { optionalAction: boolean; text?: string }) => void;
  addPlayerButton: ({ player, callback }: { player: BgaPlayer; callback: Function | string }) => void; 
  addPrimaryActionButton: (props: AddButtonProps) => void;
  addSecondaryActionButton: (props: AddButtonProps) => void;
  addDangerActionButton: (props: AddButtonProps) => void;
  addUndoButtons: (props: CommonArgs) => void;
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
  takeAction: (props: {
    action: string;
    atomicAction?: boolean;
    args?: Record<string, unknown>;
    checkAction?: string; // Action used in checkAction
  }) => void;
  updateLayout: () => void;
  animationManager: AnimationManager;
  gameMap: GameMap;
  notificationManager: NotificationManager;
  playerManager: PlayerManager;
  settings: Settings;
  tooltipManager: TooltipManager;
}

interface AGestOfRobinHoodGamedatas extends Gamedatas {
  // Default
  canceledNotifIds: string[];
  playerOrder: number[];
  players: Record<number, AGestOfRobinHoodPlayerData>;
  // Game specific
}

interface AGestOfRobinHoodPlayerData extends BgaPlayer {

}
