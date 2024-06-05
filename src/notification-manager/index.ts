//  .##....##..#######..########.####.########
//  .###...##.##.....##....##.....##..##......
//  .####..##.##.....##....##.....##..##......
//  .##.##.##.##.....##....##.....##..######..
//  .##..####.##.....##....##.....##..##......
//  .##...###.##.....##....##.....##..##......
//  .##....##..#######.....##....####.##......

//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##

class NotificationManager {
  private game: AGestOfRobinHoodGame;
  private subscriptions: unknown[];

  constructor(game) {
    this.game = game;
    this.subscriptions = [];
  }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  setupNotifications() {
    console.log('notifications subscriptions setup');

    dojo.connect(this.game.framework().notifqueue, 'addToLog', () => {
      this.game.addLogClass();
    });

    const notifs: string[] = [
      // Boilerplate
      'log',
      'clearTurn',
      'refreshUI',
      // Game
      'chooseAction',
      'drawAndRevealCard',
      'gainShillings',
      'moveCarriage',
      'moveCarriagePrivate',
      'moveCarriagePublic',
      'moveRoyalFavourMarker',
      'passAction',
      'revealCarriage',
      'revealForce',
      'payShillings',
      'placeMerryMen',
      'placeMerryMenPrivate',
    ];

    // example: https://github.com/thoun/knarr/blob/main/src/knarr.ts
    notifs.forEach((notifName) => {
      this.subscriptions.push(
        dojo.subscribe(notifName, this, (notifDetails: Notif<unknown>) => {
          debug(`notif_${notifName}`, notifDetails); // log notif params (with Tisaac log method, so only studio side)

          const promise = this[`notif_${notifName}`](notifDetails);
          const promises = promise ? [promise] : [];
          let minDuration = 1;

          // Show log messags in page title
          let msg = this.game.format_string_recursive(
            notifDetails.log,
            notifDetails.args as Record<string, unknown>
          );
          if (msg != '') {
            $('gameaction_status').innerHTML = msg;
            $('pagemaintitletext').innerHTML = msg;
            $('generalactions').innerHTML = '';

            // If there is some text, we let the message some time, to be read
            minDuration = MIN_NOTIFICATION_MS;
          }

          // Promise.all([...promises, sleep(minDuration)]).then(() =>
          //   this.game.framework().notifqueue.onSynchronousNotificationEnd()
          // );
          // tell the UI notification ends, if the function returned a promise.
          if (this.game.animationManager.animationsActive()) {
            Promise.all([...promises, sleep(minDuration)]).then(() =>
              this.game.framework().notifqueue.onSynchronousNotificationEnd()
            );
          } else {
            // TODO: check what this does
            this.game.framework().notifqueue.setSynchronousDuration(0);
          }
        })
      );
      this.game.framework().notifqueue.setSynchronous(notifName, undefined);

      this.game
        .framework()
        .notifqueue.setIgnoreNotificationCheck(
          'placeMerryMen',
          (notif: Notif<{ playerId: number }>) =>
            notif.args.playerId == this.game.getPlayerId()
        );
      this.game
        .framework()
        .notifqueue.setIgnoreNotificationCheck(
          'moveCarriage',
          (notif: Notif<{ playerId: number }>) =>
            notif.args.playerId == this.game.getPlayerId()
        );
    });
  }

  // Example code to show log messags in page title
  // I wont directly answer your issue, but propose something that will fix it and improve your game
  // put that inside any notification handler :
  // let msg = this.format_string_recursive(args.log, args.args);
  // if (msg != '') {
  //   $('gameaction_status').innerHTML = msg;
  //   $('pagemaintitletext').innerHTML = msg;
  // }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  destroy() {
    dojo.forEach(this.subscriptions, dojo.unsubscribe);
  }

  getPlayer({ playerId }: { playerId: number }): GestPlayer {
    return this.game.playerManager.getPlayer({ playerId });
  }

  currentPlayerIsRobinHood() {
    const currentPlayerId = this.game.getPlayerId();
    const robinHoodPlayerId = this.game.playerManager.getRobinHoodPlayerId();
    return currentPlayerId === robinHoodPlayerId;
  }

  currentPlayerIsSheriff() {
    const currentPlayerId = this.game.getPlayerId();
    const sheriffPlayerId = this.game.playerManager.getSheriffPlayerId();
    return currentPlayerId === sheriffPlayerId;
  }

  // .##....##..#######..########.####.########..######.
  // .###...##.##.....##....##.....##..##.......##....##
  // .####..##.##.....##....##.....##..##.......##......
  // .##.##.##.##.....##....##.....##..######....######.
  // .##..####.##.....##....##.....##..##.............##
  // .##...###.##.....##....##.....##..##.......##....##
  // .##....##..#######.....##....####.##........######.

  async notif_log(notif: Notif<unknown>) {
    // this is for debugging php side
    debug('notif_log', notif.args);
  }

  async notif_clearTurn(notif: Notif<NotifClearTurnArgs>) {
    const { notifIds } = notif.args;
    this.game.cancelLogs(notifIds);
  }


  // notif_smallRefreshHand(notif: Notif<NotifSmallRefreshHandArgs>) {
  //   const { hand, playerId } = notif.args;
  //   const player = this.getPlayer({ playerId });
  //   player.clearHand();
  //   player.setupHand({ hand });
  // }

  // async notif_smallRefreshInterface(
  //   notif: Notif<NotifSmallRefreshInterfaceArgs>
  // ) {
  //   const updatedGamedatas = {
  //     ...this.game.gamedatas,
  //     ...notif.args,
  //   };
  //   this.game.clearInterface();
  //   this.game.gamedatas = updatedGamedatas;
  //   this.game.playerManager.updatePlayers({ gamedatas: updatedGamedatas });
  //   this.game.gameMap.updateInterface({ gamedatas: updatedGamedatas });
  // }
  async notif_refreshUI(notif: Notif<NotifRefreshUIArgs>) {
    const { datas: gamedatas } = notif.args;
    const updatedGamedatas = {
      ...this.game.gamedatas,
      ...gamedatas,
    };
    this.game.gamedatas = updatedGamedatas;
    this.game.clearInterface();
    this.game.gameMap.updateInterface({ gamedatas });
    this.game.playerManager.updatePlayers({ gamedatas });
  }

  async notif_chooseAction(notif: Notif<NotifChooseActionArgs>) {
    const { marker } = notif.args;

    const markerNode = document.getElementById(marker.id);
    const toNode = document.getElementById(marker.location);

    if (!(markerNode && toNode)) {
      return;
    }

    await this.game.animationManager.attachWithAnimation(
      new BgaSlideAnimation({ element: markerNode }),
      toNode
    );
  }

  async notif_drawAndRevealCard(notif: Notif<NotifDrawAndRevealCardArgs>) {}

  async notif_gainShillings(notif: Notif<NotifGainShillingsArgs>) {
    const { amount, playerId } = notif.args;
    this.getPlayer({ playerId }).counters.shillings.incValue(amount);
  }

  async notif_moveCarriage(notif: Notif<NotifMoveCarriageArgs>) {
    const { carriage, henchman, toSpaceId, fromSpaceId } = notif.args;

    const promises = [
      this.game.gameMap.moveCarriagePublic({
        hidden: carriage.hidden,
        type: carriage.type,
        toSpaceId,
        fromSpaceId,
      }),
    ];
    if (henchman) {
      promises.push(
        this.game.gameMap.moveHenchman({ henchmanId: henchman.id, toSpaceId })
      );
    }

    await Promise.all(promises);
  }

  async notif_moveCarriagePublic(notif: Notif<NotifMoveCarriagePublicArgs>) {
    const { carriage, toSpaceId, fromSpaceId } = notif.args;
    console.log('carriage', carriage);
    if (
      this.game.getPlayerId() === this.game.playerManager.getSheriffPlayerId()
    ) {
      console.log('if');
      await this.game.gameMap.moveCarriagePrivate({
        carriageId: carriage.id,
        toSpaceId,
      });
    } else {
      console.log('else');
      await this.game.gameMap.moveCarriagePublic({
        hidden: carriage.hidden,
        type: carriage.hidden ? null : carriage.type,
        toSpaceId,
        fromSpaceId,
      });
    }
  }

  async notif_moveCarriagePrivate(notif: Notif<NotifMoveCarriagePrivateArgs>) {
    const { carriage, henchman, toSpaceId } = notif.args;

    const promises = [
      this.game.gameMap.moveCarriagePrivate({
        carriageId: carriage.id,
        toSpaceId,
      }),
    ];
    if (henchman) {
      promises.push(
        this.game.gameMap.moveHenchman({ henchmanId: henchman.id, toSpaceId })
      );
    }

    await Promise.all(promises);
  }

  async notif_moveRoyalFavourMarker(
    notif: Notif<NotifMoveRoyalFavourMarkerArgs>
  ) {
    const { marker } = notif.args;
    await this.game.gameMap.moveMarker({
      id: marker.id,
      location: marker.location,
    });
  }

  async notif_payShillings(notif: Notif<NotifPayShillingsArgs>) {
    const { amount, playerId } = notif.args;
    this.getPlayer({ playerId }).counters.shillings.incValue(-amount);
  }

  async notif_placeMerryMen(notif: Notif<NotifPlaceMerryMenArgs>) {
    const { merryMenCounts } = notif.args;
    Object.entries(merryMenCounts).forEach(([spaceId, countHidden]) => {
      this.game.gameMap.addPublicForces({
        spaceId,
        count: countHidden,
        hidden: true,
        type: MERRY_MEN,
      });
    });
  }

  async notif_placeMerryMenPrivate(
    notif: Notif<NotifPlaceMerryMenPrivateArgs>
  ) {
    const { robinHood, merryMen } = notif.args;
    if (robinHood) {
      this.game.gameMap.addPrivateForce({ force: robinHood });
    }
    merryMen.forEach((merryMan) =>
      this.game.gameMap.addPrivateForce({ force: merryMan })
    );
  }

  async notif_revealCarriage(notif: Notif<NotifRevealCarriageArgs>) {
    const { carriage, playerId } = notif.args;

    const element =
      this.game.getPlayerId() === this.game.playerManager.getSheriffPlayerId()
        ? document.getElementById(carriage.id)
        : this.game.gameMap.getCarriageElement({
            spaceId: carriage.location,
            hidden: true,
            type: null,
          });

    if (!element) {
      return;
    }
    element.setAttribute('data-hidden', 'false');
    element.replaceChildren();
    element.insertAdjacentHTML(
      'afterbegin',
      `<span>${carriage.type.substring(0, 3).toUpperCase()}</span>`
    );
  }

  async notif_revealForce(notif: Notif<NotifRevealForceArgs>) {
    const { force } = notif.args;

    if ([MERRY_MEN, CAMP, ROBIN_HOOD].includes(force.type)) {
      if (this.currentPlayerIsRobinHood()) {
        this.game.gameMap.revealForcePrivate({ force });
      } else {
        this.game.gameMap.revealForcePublic({ force });
      }
    } else if (
      [TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].includes(force.type)
    ) {
      if (this.currentPlayerIsSheriff()) {
        this.game.gameMap.revealForcePrivate({ force });
      } else {
        this.game.gameMap.revealForcePublic({ force });
      }
    }
  }
}
