/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * A Gest of Robin Hood implementation : © Frans Bongers <fjmbongers@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * agestofrobinhood.js
 *
 * agestofrobinhood user interface script
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

declare const define; // TODO: check if we comment here or in bga-animations module?
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _: (stringToTranslate: string) => string;
declare const g_gamethemeurl;
declare const playSound;
declare var noUiSlider;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

class AGestOfRobinHood implements AGestOfRobinHoodGame {
  public gamedatas: AGestOfRobinHoodGamedatas;

  // Default
  public animationManager: AnimationManager;
  public infoPanel: InfoPanel;
  public settings: Settings;
  // public gameOptions: * AGestOfRobinHoodGamedatas['gameOptions'];
  public notificationManager: NotificationManager;
  public playerManager: PlayerManager;
  public playerOrder: number[];
  public tooltipManager: TooltipManager;

  // Boiler plate
  private alwaysFixTopActions: boolean;
  private alwaysFixTopActionsMaximum: number;
  public tooltipsToMap: [tooltipId: number, card_id: string][] = [];
  public _connections: unknown[];
  private _helpMode = false; // Use to implement help mode
  private _last_notif = null;
  public _last_tooltip_id = 0;
  private _notif_uid_to_log_id = {};
  private _notif_uid_to_mobile_log_id = {};
  private _selectableNodes = []; // TODO: use to keep track of selectable classed?

  // Game specific
  public gameMap: GameMap;
  public markerManager: MarkerManager;

  public activeStates: {
    // Boiler plate
    confirmPartialTurn: ConfirmPartialTurnState;
    confirmTurn: ConfirmTurnState;
    // Game
    chooseAction: ChooseActionState;
    moveCarriage: MoveCarriageState;
    recruit: RecruitState;
    rob: RobState;
    selectDeed: SelectDeedState;
    selectPlot: SelectPlotState;
    setupRobinHood: SetupRobinHoodState;
    sneak: SneakState;
  };

  constructor() {
    console.log('agestofrobinhood constructor');
  }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......
  public setup(gamedatas: AGestOfRobinHoodGamedatas) {
    // Create a new div for buttons to avoid BGA auto clearing it
    dojo.place(
      "<div id='customActions' style='display:inline-block'></div>",
      $('generalactions'),
      'after'
    );
    this.setAlwaysFixTopActions();
    this.setupDontPreloadImages();

    this.gamedatas = gamedatas;
    // this.gameOptions = gamedatas.gameOptions;
    debug('gamedatas', gamedatas);
    //  this.setupPlayerOrder({ playerOrder: gamedatas.playerOrder });

    this._connections = [];

    // Will store all data for active player and gets refreshed with entering player actions state
    this.activeStates = {
      // Boiler plate
      confirmPartialTurn: new ConfirmPartialTurnState(this),
      confirmTurn: new ConfirmTurnState(this),
      // Game
      chooseAction: new ChooseActionState(this),
      moveCarriage: new MoveCarriageState(this),
      recruit: new RecruitState(this),
      rob: new RobState(this),
      selectDeed: new SelectDeedState(this),
      selectPlot: new SelectPlotState(this),
      setupRobinHood: new SetupRobinHoodState(this),
      sneak: new SneakState(this),
    };

    this.infoPanel = new InfoPanel(this);
    this.settings = new Settings(this);

    this.animationManager = new AnimationManager(this, {
      duration:
        this.settings.get({ id: PREF_SHOW_ANIMATIONS }) === DISABLED
          ? 0
          : 2100 - (this.settings.get({ id: PREF_ANIMATION_SPEED }) as number),
    });

    this.markerManager = new MarkerManager(this);

    this.gameMap = new GameMap(this);
    this.tooltipManager = new TooltipManager(this);
    this.playerManager = new PlayerManager(this);

    if (this.notificationManager != undefined) {
      this.notificationManager.destroy();
    }
    this.notificationManager = new NotificationManager(this);
    this.notificationManager.setupNotifications();

    this.tooltipManager.setupTooltips();
    debug('Ending game setup');
  }

  // Sets player order with current player at index 0 if player is in the game
  setupPlayerOrder({ playerOrder }: { playerOrder: number[] }) {
    const currentPlayerId = this.getPlayerId();
    const isInGame = playerOrder.includes(currentPlayerId);
    if (isInGame) {
      while (playerOrder[0] !== currentPlayerId) {
        const firstItem = playerOrder.shift();
        playerOrder.push(firstItem);
      }
    }
    this.playerOrder = playerOrder;
  }

  /**
   * Example:
   * this.framework().dontPreloadImage("background_balcony.webp");
   */
  setupDontPreloadImages() {}

  //  .####.##....##.########.########.########.....###.....######..########.####..#######..##....##
  //  ..##..###...##....##....##.......##.....##...##.##...##....##....##.....##..##.....##.###...##
  //  ..##..####..##....##....##.......##.....##..##...##..##..........##.....##..##.....##.####..##
  //  ..##..##.##.##....##....######...########..##.....##.##..........##.....##..##.....##.##.##.##
  //  ..##..##..####....##....##.......##...##...#########.##..........##.....##..##.....##.##..####
  //  ..##..##...###....##....##.......##....##..##.....##.##....##....##.....##..##.....##.##...###
  //  .####.##....##....##....########.##.....##.##.....##..######.....##....####..#######..##....##

  ///////////////////////////////////////////////////
  //// Game & client states

  // onEnteringState: this method is called each time we are entering into a new game state.
  //                  You can use this method to perform some user interface changes at this moment.
  public onEnteringState(stateName: string, args: any) {
    console.log('Entering state: ' + stateName, args);
    // UI changes for active player
    if (
      this.framework().isCurrentPlayerActive() &&
      this.activeStates[stateName]
    ) {
      this.activeStates[stateName].onEnteringState(args.args);
    } else if (this.activeStates[stateName]) {
      this.activeStates[stateName].setDescription(
        Number(args.active_player),
        args.args
      );
    }

    // if (this.framework().isCurrentPlayerActive()) {
    //   this.addPrimaryActionButton({
    //     id: "pass_button",
    //     text: _("Pass"),
    //     callback: () => this.takeAction({ action: "passTurn" }),
    //   });
    //   this.addDangerActionButton({
    //     id: "end_game_button",
    //     text: _("End game"),
    //     callback: () => this.takeAction({ action: "endGame" }),
    //   });
    // }

    // Undo last steps
    if (args.args && args.args.previousSteps) {
      args.args.previousSteps.forEach((stepId: number) => {
        let logEntry = $('logs').querySelector(
          `.log.notif_newUndoableStep[data-step="${stepId}"]`
        );
        if (logEntry) {
          this.onClick(logEntry, () => this.undoToStep({ stepId }));
        }

        logEntry = document.querySelector(
          `.chatwindowlogs_zone .log.notif_newUndoableStep[data-step="${stepId}"]`
        );
        if (logEntry) {
          this.onClick(logEntry, () => this.undoToStep({ stepId }));
        }
      });
    }
  }

  // onLeavingState: this method is called each time we are leaving a game state.
  //                 You can use this method to perform some user interface changes at this moment.
  //
  public onLeavingState(stateName: string) {
    this.clearPossible();
  }

  // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
  //                        action status bar (ie: the HTML links in the status bar).
  //
  public onUpdateActionButtons(stateName: string, args: any) {
    // console.log('onUpdateActionButtons: ' + stateName);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  ///////////////////////////////////////////////////
  //// Utility methods - add in alphabetical order

  /*
   * Add a blue/grey button if it doesn't already exists
   */
  addActionButtonClient({
    id,
    text,
    callback,
    extraClasses,
    color = 'none',
  }: {
    id: string;
    text: string;
    callback: Function | string;
    extraClasses?: string;
    color?: 'blue' | 'gray' | 'red' | 'none';
  }) {
    if ($(id)) {
      return;
    }
    this.framework().addActionButton(
      id,
      text,
      callback,
      'customActions',
      false,
      color
    );
    if (extraClasses) {
      dojo.addClass(id, extraClasses);
    }
  }

  addCancelButton({ callback }: { callback?: Function } = {}) {
    this.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: () => {
        if (callback) {
          callback();
        }
        this.onCancel();
      },
    });
  }

  addConfirmButton({ callback }: { callback: Function | string }) {
    this.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback,
    });
  }

  addPassButton({
    optionalAction,
    text,
  }: {
    optionalAction: boolean;
    text?: string;
  }) {
    if (optionalAction) {
      this.addSecondaryActionButton({
        id: 'pass_btn',
        text: text ? _(text) : _('Pass'),
        callback: () =>
          this.takeAction({
            action: 'actPassOptionalAction',
            atomicAction: false,
          }),
      });
    }
  }

  addPlayerButton({
    player,
    callback,
  }: {
    player: BgaPlayer;
    callback: Function | string;
  }) {
    const id = `select_${player.id}`;

    this.addPrimaryActionButton({
      id,
      text: player.name,
      callback,
    });

    const node = document.getElementById(id);
    node.style.backgroundColor = `#${player.color}`;
  }

  addPrimaryActionButton({
    id,
    text,
    callback,
    extraClasses,
  }: {
    id: string;
    text: string;
    callback: Function | string;
    extraClasses?: string;
  }) {
    if ($(id)) {
      return;
    }
    this.framework().addActionButton(
      id,
      text,
      callback,
      'customActions',
      false,
      'blue'
    );
    if (extraClasses) {
      dojo.addClass(id, extraClasses);
    }
  }

  addSecondaryActionButton({
    id,
    text,
    callback,
    extraClasses,
  }: {
    id: string;
    text: string;
    callback: Function | string;
    extraClasses?: string;
  }) {
    if ($(id)) {
      return;
    }
    this.framework().addActionButton(
      id,
      text,
      callback,
      'customActions',
      false,
      'gray'
    );
    if (extraClasses) {
      dojo.addClass(id, extraClasses);
    }
  }

  addDangerActionButton({
    id,
    text,
    callback,
    extraClasses,
  }: {
    id: string;
    text: string;
    callback: Function | string;
    extraClasses?: string;
  }) {
    if ($(id)) {
      return;
    }
    this.framework().addActionButton(
      id,
      text,
      callback,
      'customActions',
      false,
      'red'
    );
    if (extraClasses) {
      dojo.addClass(id, extraClasses);
    }
  }

  addUndoButtons({ previousSteps, previousEngineChoices }: CommonArgs) {
    const lastStep = Math.max(0, ...previousSteps);
    if (lastStep > 0) {
      // this.addDangerActionButton('btnUndoLastStep', _('Undo last step'), () => this.undoToStep(lastStep), 'restartAction');
      this.addDangerActionButton({
        id: 'undo_last_step_btn',
        text: _('Undo last step'),
        callback: () =>
          this.takeAction({
            action: 'actUndoToStep',
            args: {
              stepId: lastStep,
            },
            checkAction: 'actRestart',
            atomicAction: false,
          }),
      });
    }

    if (previousEngineChoices > 0) {
      this.addDangerActionButton({
        id: 'restart_btn',
        text: _('Restart turn'),
        callback: () =>
          this.takeAction({ action: 'actRestart', atomicAction: false }),
      });
    }
  }

  public clearInterface() {
    console.log('clear interface');
    this.playerManager.clearInterface();
    this.gameMap.clearInterface();
  }

  clearPossible() {
    this.framework().removeActionButtons();
    dojo.empty('customActions');

    dojo.forEach(this._connections, dojo.disconnect);
    this._connections = [];

    dojo.query(`.${GEST_SELECTABLE}`).removeClass(GEST_SELECTABLE);
    dojo.query(`.${GEST_SELECTED}`).removeClass(GEST_SELECTED);
  }

  public getPlayerId(): number {
    return Number(this.framework().player_id);
  }

  public getCurrentPlayer(): GestPlayer {
    return this.playerManager.getPlayer({ playerId: this.getPlayerId() });
  }

  /**
   * Typescript wrapper for framework functions
   */
  public framework(): Framework {
    return this as unknown as Framework;
  }

  onCancel() {
    this.clearPossible();
    this.framework().restoreServerGameState();
  }

  clientUpdatePageTitle({
    text,
    args,
    nonActivePlayers = false,
  }: {
    text: string;
    args: Record<string, string | number>;
    nonActivePlayers?: boolean;
  }) {
    const title = this.format_string_recursive(_(text), args);
    if (nonActivePlayers) {
      this.gamedatas.gamestate.description = title;
    } else {
      this.gamedatas.gamestate.descriptionmyturn = title;
    }
    this.framework().updatePageTitle();
  }

  setCardSelectable({
    id,
    callback,
  }: {
    id: string;
    callback: (event: PointerEvent) => void;
  }) {
    const node = $(id);
    if (node === null) {
      return;
    }
    node.classList.add(GEST_SELECTABLE);
    this._connections.push(
      dojo.connect(node, 'onclick', this, (event: PointerEvent) =>
        callback(event)
      )
    );
  }

  setCardSelected({ id }: { id: string }) {
    const node = $(id);
    if (node === null) {
      return;
    }
    node.classList.add(GEST_SELECTED);
  }

  setLocationSelectable({
    id,
    callback,
  }: {
    id: string;
    callback: (event: PointerEvent) => void;
  }) {
    const node = $(id);

    if (node === null) {
      return;
    }
    node.classList.add(GEST_SELECTABLE);
    this._connections.push(
      dojo.connect(node, 'onclick', this, (event: PointerEvent) =>
        callback(event)
      )
    );
  }

  setLocationSelected({ id }: { id: string }) {
    const node = $(id);
    if (node === null) {
      return;
    }
    node.classList.add(GEST_SELECTED);
  }

  setElementSelectable({
    id,
    callback,
  }: {
    id: string;
    callback: (event: PointerEvent) => void;
  }) {
    const node = $(id);
    if (node === null) {
      return;
    }
    node.classList.add(GEST_SELECTABLE);
    this._connections.push(
      dojo.connect(node, 'onclick', this, (event: PointerEvent) =>
        callback(event)
      )
    );
  }

  setElementSelected({ id }: { id: string }) {
    const node = $(id);
    if (node === null) {
      return;
    }
    node.classList.add(GEST_SELECTED);
  }

  // .########...#######..####.##.......########.########.
  // .##.....##.##.....##..##..##.......##.......##.....##
  // .##.....##.##.....##..##..##.......##.......##.....##
  // .########..##.....##..##..##.......######...########.
  // .##.....##.##.....##..##..##.......##.......##...##..
  // .##.....##.##.....##..##..##.......##.......##....##.
  // .########...#######..####.########.########.##.....##

  // .########..##..........###....########.########
  // .##.....##.##.........##.##......##....##......
  // .##.....##.##........##...##.....##....##......
  // .########..##.......##.....##....##....######..
  // .##........##.......#########....##....##......
  // .##........##.......##.....##....##....##......
  // .##........########.##.....##....##....########

  /*
   * Custom connect that keep track of all the connections
   *  and wrap clicks to make it work with help mode
   */
  connect(node: HTMLElement, action: string, callback: Function) {
    this._connections.push(dojo.connect($(node), action, callback));
  }

  onClick(node: HTMLElement, callback: Function, temporary = true) {
    let safeCallback = (evt) => {
      evt.stopPropagation();
      if (this.framework().isInterfaceLocked()) {
        return false;
      }
      if (this._helpMode) {
        return false;
      }
      callback(evt);
    };

    if (temporary) {
      this.connect($(node), 'click', safeCallback);
      dojo.removeClass(node, 'unselectable'); // replace with pr_selectable / pr_selected
      dojo.addClass(node, 'selectable');
      this._selectableNodes.push(node);
    } else {
      dojo.connect($(node), 'click', safeCallback);
    }
  }

  undoToStep({ stepId }: { stepId: string | number }) {
    // this.stopActionTimer();
    // this.framework().checkAction("actRestart");
    // this.takeAction('actUndoToStep', args: { stepId });
    this.takeAction({
      action: 'actUndoToStep',
      args: {
        stepId,
      },
      checkAction: 'actRestart',
    });
  }

  public updateLayout() {
    if (!this.settings) {
      return;
    }

    $('play_area_container').setAttribute(
      'data-two-columns',
      this.settings.get({ id: 'twoColumnsLayout' })
    );

    const ROOT = document.documentElement;
    let WIDTH = $('play_area_container').getBoundingClientRect()['width'] - 8;
    const LEFT_COLUMN = 1500;
    const RIGHT_COLUMN = 1500;

    if (this.settings.get({ id: 'twoColumnsLayout' }) === PREF_ENABLED) {
      WIDTH = WIDTH - 8; // grid gap
      const size = Number(this.settings.get({ id: 'columnSizes' }));
      const proportions = [size, 100 - size];
      const LEFT_SIZE = (proportions[0] * WIDTH) / 100;
      const leftColumnScale = LEFT_SIZE / LEFT_COLUMN;
      ROOT.style.setProperty('--leftColumnScale', `${leftColumnScale}`);
      ROOT.style.setProperty('--mapSizeMultiplier', '1');
      const RIGHT_SIZE = (proportions[1] * WIDTH) / 100;
      const rightColumnScale = RIGHT_SIZE / RIGHT_COLUMN;
      ROOT.style.setProperty('--rightColumnScale', `${rightColumnScale}`);

      $(
        'play_area_container'
      ).style.gridTemplateColumns = `${LEFT_SIZE}px ${RIGHT_SIZE}px`;
    } else {
      const LEFT_SIZE = WIDTH;
      const leftColumnScale = LEFT_SIZE / LEFT_COLUMN;
      ROOT.style.setProperty('--leftColumnScale', `${leftColumnScale}`);
      ROOT.style.setProperty(
        '--mapSizeMultiplier',
        `${
          Number(this.settings.get({ id: PREF_SINGLE_COLUMN_MAP_SIZE })) / 100
        }`
      );
      const RIGHT_SIZE = WIDTH;
      const rightColumnScale = RIGHT_SIZE / RIGHT_COLUMN;
      ROOT.style.setProperty('--rightColumnScale', `${rightColumnScale}`);
    }
  }

  // .########.########.....###....##.....##.########.##......##..#######..########..##....##
  // .##.......##.....##...##.##...###...###.##.......##..##..##.##.....##.##.....##.##...##.
  // .##.......##.....##..##...##..####.####.##.......##..##..##.##.....##.##.....##.##..##..
  // .######...########..##.....##.##.###.##.######...##..##..##.##.....##.########..#####...
  // .##.......##...##...#########.##.....##.##.......##..##..##.##.....##.##...##...##..##..
  // .##.......##....##..##.....##.##.....##.##.......##..##..##.##.....##.##....##..##...##.
  // .##.......##.....##.##.....##.##.....##.########..###..###...#######..##.....##.##....##

  // ..#######..##.....##.########.########..########..####.########..########..######.
  // .##.....##.##.....##.##.......##.....##.##.....##..##..##.....##.##.......##....##
  // .##.....##.##.....##.##.......##.....##.##.....##..##..##.....##.##.......##......
  // .##.....##.##.....##.######...########..########...##..##.....##.######....######.
  // .##.....##..##...##..##.......##...##...##...##....##..##.....##.##.............##
  // .##.....##...##.##...##.......##....##..##....##...##..##.....##.##.......##....##
  // ..#######.....###....########.##.....##.##.....##.####.########..########..######.

  /**
   * Apparently onAdding<notif id>ToLog is called with every notification
   */
  onAddingNewUndoableStepToLog(notif: {
    logId: number;
    mobileLogId: number;
    msg: Notif<{
      preserve: string;
      processed: boolean;
      stepId: number | string;
    }>;
  }) {
    if (!$(`log_${notif.logId}`)) return;
    let stepId = notif.msg.args.stepId;
    $(`log_${notif.logId}`).dataset.step = stepId;
    if ($(`dockedlog_${notif.mobileLogId}`))
      $(`dockedlog_${notif.mobileLogId}`).dataset.step = stepId;

    if (
      (
        this.gamedatas.gamestate as ActiveGamestate<{
          previousSteps?: number[];
        }>
      ).args.previousSteps?.includes(Number(stepId))
    ) {
      this.onClick($(`log_${notif.logId}`), () => this.undoToStep({ stepId }));
      if ($(`dockedlog_${notif.mobileLogId}`))
        this.onClick($(`dockedlog_${notif.mobileLogId}`), () =>
          this.undoToStep({ stepId })
        );
    }
  }

  /*
   * Remove non standard zoom property
   */
  onScreenWidthChange() {
    this.updateLayout();
  }

  /* @Override */
  format_string_recursive(log: string, args: Record<string, unknown>): string {
    try {
      if (log && args && !args.processed) {
        args.processed = true;

        // replace all keys that start with 'logToken'
        Object.entries(args).forEach(([key, value]) => {
          if (key.startsWith('tkn_')) {
            args[key] = getTokenDiv({
              key,
              value: value as string,
              game: this,
            });
          }
        });
      }
    } catch (e) {
      console.error(log, args, 'Exception thrown', e.stack);
    }
    return (this as any).inherited(arguments);
  }

  /*
   * [Undocumented] Called by BGA framework on any notification message
   * Handle cancelling log messages for restart turn
   */
  onPlaceLogOnChannel(msg: Notif<unknown>) {
    // console.log('msg', msg);
    const currentLogId = this.framework().notifqueue.next_log_id;
    const currentMobileLogId = this.framework().next_log_id;
    const res = this.framework().inherited(arguments);
    this._notif_uid_to_log_id[msg.uid] = currentLogId;
    this._notif_uid_to_mobile_log_id[msg.uid] = currentMobileLogId;
    this._last_notif = {
      logId: currentLogId,
      mobileLogId: currentMobileLogId,
      msg,
    };
    // console.log('_notif_uid_to_log_id', this._notif_uid_to_log_id);
    return res;
  }

  /*
   * cancelLogs:
   *   strikes all log messages related to the given array of notif ids
   */
  checkLogCancel(notifId: string) {
    if (
      this.gamedatas.canceledNotifIds != null &&
      this.gamedatas.canceledNotifIds.includes(notifId)
    ) {
      this.cancelLogs([notifId]);
    }
  }

  public cancelLogs(notifIds: string[]) {
    notifIds.forEach((uid) => {
      if (this._notif_uid_to_log_id.hasOwnProperty(uid)) {
        let logId = this._notif_uid_to_log_id[uid];
        if ($('log_' + logId)) dojo.addClass('log_' + logId, 'cancel');
      }
      if (this._notif_uid_to_mobile_log_id.hasOwnProperty(uid)) {
        let mobileLogId = this._notif_uid_to_mobile_log_id[uid];
        if ($('dockedlog_' + mobileLogId))
          dojo.addClass('dockedlog_' + mobileLogId, 'cancel');
      }
    });
  }

  addLogClass() {
    if (this._last_notif == null) {
      return;
    }

    let notif = this._last_notif;
    let type = notif.msg.type;
    if (type == 'history_history') {
      type = notif.msg.args.originalType;
    }

    if ($('log_' + notif.logId)) {
      dojo.addClass('log_' + notif.logId, 'notif_' + type);

      var methodName =
        'onAdding' + type.charAt(0).toUpperCase() + type.slice(1) + 'ToLog';
      this[methodName]?.(notif);
    }
    if ($('dockedlog_' + notif.mobileLogId)) {
      dojo.addClass('dockedlog_' + notif.mobileLogId, 'notif_' + type);
    }

    // while (this.tooltipsToMap.length) {
    //   const tooltipToMap = this.tooltipsToMap.pop();
    //   if (!tooltipToMap || !tooltipToMap[1]) {
    //     console.error("error tooltipToMap", tooltipToMap);
    //   } else {
    //     this.addLogTooltip({
    //       tooltipId: tooltipToMap[0],
    //       cardId: tooltipToMap[1],
    //     });
    //   }
    // }
  }

  // cardId will be PRENXXXX for tableau cards and full id for empire card / victory card
  addLogTooltip({ tooltipId, cardId }: { tooltipId: number; cardId: string }) {}

  /*
   * [Undocumented] Override BGA framework functions to call onLoadingComplete when loading is done
   */
  setLoader(value, max) {
    this.framework().inherited(arguments);
    if (!this.framework().isLoadingComplete && value >= 100) {
      this.framework().isLoadingComplete = true;
      this.onLoadingComplete();
    }
  }

  onLoadingComplete() {
    // debug('Loading complete');
    this.cancelLogs(this.gamedatas.canceledNotifIds);
    this.updateLayout();
    // this.inherited(arguments);
  }

  /* @Override */
  updatePlayerOrdering() {
    this.framework().inherited(arguments);

    const container = document.getElementById('player_boards');
    const infoPanel = document.getElementById('info_panel');
    if (!container) {
      return;
    }
    container.insertAdjacentElement('afterbegin', infoPanel);
  }

  setAlwaysFixTopActions(alwaysFixed = true, maximum = 30) {
    this.alwaysFixTopActions = alwaysFixed;
    this.alwaysFixTopActionsMaximum = maximum;
    this.adaptStatusBar();
  }

  adaptStatusBar() {
    (this as any).inherited(arguments);

    if (this.alwaysFixTopActions) {
      const afterTitleElem = document.getElementById('after-page-title');
      const titleElem = document.getElementById('page-title');
      let zoom = (getComputedStyle(titleElem) as any).zoom;
      if (!zoom) {
        zoom = 1;
      }

      const titleRect = afterTitleElem.getBoundingClientRect();
      if (
        titleRect.top < 0 &&
        titleElem.offsetHeight <
          (window.innerHeight * this.alwaysFixTopActionsMaximum) / 100
      ) {
        const afterTitleRect = afterTitleElem.getBoundingClientRect();
        titleElem.classList.add('fixed-page-title');
        titleElem.style.width = (afterTitleRect.width - 10) / zoom + 'px';
        afterTitleElem.style.height = titleRect.height + 'px';
      } else {
        titleElem.classList.remove('fixed-page-title');
        titleElem.style.width = 'auto';
        afterTitleElem.style.height = '0px';
      }
    }
  }

  // .########..#######......######..##.....##.########..######..##....##
  // ....##....##.....##....##....##.##.....##.##.......##....##.##...##.
  // ....##....##.....##....##.......##.....##.##.......##.......##..##..
  // ....##....##.....##....##.......#########.######...##.......#####...
  // ....##....##.....##....##.......##.....##.##.......##.......##..##..
  // ....##....##.....##....##....##.##.....##.##.......##....##.##...##.
  // ....##.....#######......######..##.....##.########..######..##....##

  //....###..........##....###....##.....##
  //...##.##.........##...##.##....##...##.
  //..##...##........##..##...##....##.##..
  //.##.....##.......##.##.....##....###...
  //.#########.##....##.#########...##.##..
  //.##.....##.##....##.##.....##..##...##.
  //.##.....##..######..##.....##.##.....##

  actionError(actionName: string) {
    this.framework().showMessage(`cannot take ${actionName} action`, 'error');
  }

  /*
   * Make an AJAX call with automatic lock
   */
  takeAction({
    action,
    atomicAction = true,
    args = {},
    checkAction,
  }: {
    action: string;
    atomicAction?: boolean;
    args?: Record<string, unknown>;
    checkAction?: string; // Action used in checkAction
  }) {
    const actionName = atomicAction ? action : undefined;
    console.log('action error', checkAction || action);
    if (!this.framework().checkAction(checkAction || action)) {
      this.actionError(action);
      return;
    }
    const data = {
      lock: true,
      actionName,
      args: JSON.stringify(args),
    };
    // data.
    const gameName = this.framework().game_name;
    this.framework().ajaxcall(
      `/${gameName}/${gameName}/${
        atomicAction ? 'actTakeAtomicAction' : action
      }.html`,
      data,
      this,
      () => {}
    );
  }

  // // Generic call for Atomic Action that encode args as a JSON to be decoded by backend
  // takeAtomicAction(action, args, warning = false) {
  //   if (!this.framework().checkAction(action)) {
  //     this.actionError(action);
  //     return;
  //   }

  //   this.takeAction({
  //     action: "actTakeAtomicAction",
  //     args: { actionName: action, actionArgs: args },
  //   });
  // }
}
