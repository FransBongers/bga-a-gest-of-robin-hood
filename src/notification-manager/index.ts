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

    /**
     * In general:
     * private is only for owning player
     * all is for both players and spectators
     * public / no suffix is for other player and spectators, not owning player
     */
    const notifs: string[] = [
      // Boilerplate
      'log',
      'message',
      'clearTurn',
      'refreshUI',
      'refreshForcesPrivate',
      // Game
      'placeBridge',
      'captureMerryMen',
      'chooseAction',
      'drawAndRevealCard',
      'drawAndRevealTravellerCard',
      'gainShillings',
      'hideForce',
      'moveCarriage',
      'moveCarriagePrivate',
      'moveCarriagePublic',
      'moveMerryMenPublic', // all other players
      'moveMerryMenPrivate', // Robin Hood player
      'moveForces',
      'moveRoyalFavourMarker',
      'moveRoyalInspectionMarker',
      'passAction',
      'revealCarriage',
      'revealForce',
      'robTakeTwoShillingsFromTheSheriff',
      'parishStatus',
      'payShillings',
      'placeCardInTravellersDeck',
      'placeForceAll',
      'placeForce',
      'placeForcePrivate',
      'placeMerryMenPublic',
      'placeMerryMenPrivate',
      'putCardInVictimsPile',
      'putTravellerInDiscardPile',
      'redeploymentSheriff',
      'removeCardFromGame',
      'removeForceFromGamePrivate',
      'removeForceFromGamePublic',
      'returnTravellersDiscardToMainDeck',
      'returnToSupplyPublic',
      'returnToSupplyPrivate',
      'sneakMerryMen', // Can be deleted?
      'sneakMerryMenPrivate',
      'startOfRound',
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
          // TODO: check if this clearPossible causes any issues?
          this.game.clearPossible();
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

      [
        'placeMerryMenPublic',
        'returnToSupplyPublic',
        'moveCarriagePublic',
        'placeForce',
        'sneakMerryMen',
        'moveMerryMenPublic',
        'removeForceFromGamePublic',
      ].forEach((notifId) => {
        this.game
          .framework()
          .notifqueue.setIgnoreNotificationCheck(
            notifId,
            (notif: Notif<{ playerId: number }>) =>
              notif.args.playerId == this.game.getPlayerId()
          );
      });
      // this.game
      //   .framework()
      //   .notifqueue.setIgnoreNotificationCheck(
      //     'placeMerryMen',
      //     (notif: Notif<{ playerId: number }>) =>
      //       notif.args.playerId == this.game.getPlayerId()
      //   );
      // this.game
      //   .framework()
      //   .notifqueue.setIgnoreNotificationCheck(
      //     'moveCarriagePublic',
      //     (notif: Notif<{ playerId: number }>) =>
      //       notif.args.playerId == this.game.getPlayerId()
      //   );
      // this.game
      //   .framework()
      //   .notifqueue.setIgnoreNotificationCheck(
      //     'placeForce',
      //     (notif: Notif<{ playerId: number }>) =>
      //       notif.args.playerId == this.game.getPlayerId()
      //   );
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

  async notif_message(notif: Notif<unknown>) {
    // Only here so messages get displayed in title bar
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

  async notif_refreshForcesPrivate(notif: Notif<NotifRefreshForcesPrivate>) {
    const { forces: data, playerId } = notif.args;
    const { supply, ...forcesInSpaces } = data;
    const player = this.getPlayer({ playerId });
    if (player.isRobinHood()) {
      player.updateRobinHoodIconCountersPrivate({
        Camp: supply.Camp || 0,
        MerryMen: supply.MerryMen || 0,
        RobinHood: supply.RobinHood || 0,
      });
    } else if (player.isSheriff) {
      player.updateSheriffIconCountersPrivate({
        TallageCarriage: supply.TallageCarriage || 0,
        TributeCarriage: supply.TributeCarriage || 0,
        TrapCarriage: supply.TrapCarriage || 0,
        Henchmen: supply.Henchmen || 0,
      });
    }
    Object.entries(forcesInSpaces).forEach(([spaceId, forces]) => {
      forces.forEach((force) => this.game.gameMap.addPrivateForce({ force }));
    });
  }

  async notif_placeBridge(notif: Notif<NotifPlaceBridgeArgs>) {
    const { borderId } = notif.args;
    this.game.gameMap.placeBridge({ borderId });
  }

  async notif_captureMerryMen(notif: Notif<NotifCaptureMerryMenArgs>) {
    const { capturedPieces } = notif.args;
    if (this.currentPlayerIsRobinHood()) {
      await this.game.gameMap.forces[`${MERRY_MEN}_${PRISON}`].addCards(
        capturedPieces.map((piece) => piece.force)
      );
    } else {
      const selectedForces: GestForce[] = [];

      capturedPieces.forEach((piece) => {
        const selected = this.game.gameMap.getForcePublic({
          type: piece.type,
          hidden: piece.hidden,
          spaceId: piece.spaceId,
          exclude: selectedForces,
        });
        selectedForces.push(selected);
      });
      await this.game.gameMap.forces[`${MERRY_MEN}_${PRISON}`].addCards(
        selectedForces
      );
    }
  }

  // TODO: rename to move marker or something as it's also used to return markers
  // at end of round?
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

  async notif_drawAndRevealCard(notif: Notif<NotifDrawAndRevealCardArgs>) {
    const { card } = notif.args;
    card.location = EVENTS_DECK;
    await this.game.cardArea.stocks.eventsDeck.addCard(card);
    card.location = EVENTS_DISCARD;
    const cardsCurrentlyInDiscard =
      this.game.cardArea.stocks.eventsDiscard.getCards();
    await this.game.cardArea.stocks.eventsDiscard.addCard(card);
    await this.game.cardArea.stocks.eventsDiscard.removeCards(
      cardsCurrentlyInDiscard
    );
    this.game.infoPanel.updateModalContent(card);
    if (
      this.game.getStaticCardData(card.id).eventType ===
      'fortuneEvent'
    ) {
      this.game.infoPanel.updateFortuneEventRevealed(true);
    }
    const cardInfoNode = document.getElementById(`cardsInfo_${card.id}`);
    if (cardInfoNode) {
      cardInfoNode.setAttribute('data-resolved', 'true');
    }
  }

  async notif_drawAndRevealTravellerCard(
    notif: Notif<NotifDrawAndRevealTravellerCardArgs>
  ) {
    const { card } = notif.args;
    // card.location = TRAVELLERS_DECK;
    // await this.game.cardArea.stocks.travellersDeck.addCard(card);
    card.location = TRAVELLER_ROBBED;
    // this.game.cardArea.incTravellerInDeckCounterValue(
    //   card.id.split('_')[1],
    //   -1
    // );
    // this.game.cardArea.counters.travellersDeck.incValue(-1);
    await this.game.cardArea.stocks.travellerRobbed.addCard(card);
  }

  async notif_gainShillings(notif: Notif<NotifGainShillingsArgs>) {
    const { amount, playerId } = notif.args;
    this.getPlayer({ playerId }).counters.shillings.incValue(amount);
  }

  async notif_hideForce(notif: Notif<NotifHideForceArgs>) {
    const { force } = notif.args;

    if ([MERRY_MEN, CAMP, ROBIN_HOOD].includes(force.type)) {
      if (this.currentPlayerIsRobinHood()) {
        this.game.gameMap.hideForcePrivate({ force });
      } else {
        this.game.gameMap.hideForcePublic({ force });
      }
    } else if (
      [TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].includes(force.type)
    ) {
      if (this.currentPlayerIsSheriff()) {
        this.game.gameMap.hideForcePrivate({ force });
      } else {
        this.game.gameMap.hideForcePublic({ force });
      }
    }
  }

  // async notif_moveCarriage(notif: Notif<NotifMoveCarriageArgs>) {
  //   const { carriage, henchman, toSpaceId, fromSpaceId } = notif.args;

  //   const promises = [
  //     this.game.gameMap.moveForcePublic({
  //       hidden: carriage.hidden,
  //       type: carriage.type,
  //       toSpaceId,
  //       fromSpaceId,
  //     }),
  //   ];
  //   if (henchman) {
  //     promises.push(
  //       this.game.gameMap.moveForcePrivate({ force: henchman })
  //     );
  //   }

  //   await Promise.all(promises);
  // }

  async notif_moveCarriagePublic(notif: Notif<NotifMoveCarriagePublicArgs>) {
    const { carriage, toSpaceId, fromSpaceId, henchman } = notif.args;

    const promises = [
      this.game.gameMap.moveForcePublic({
        hidden: carriage.hidden,
        type: carriage.type,
        toSpaceId,
        fromSpaceId,
      }),
    ];

    if (henchman) {
      promises.push(this.game.gameMap.moveForcePrivate({ force: henchman }));
    }

    await Promise.all(promises);

    // if (
    //   this.game.getPlayerId() === this.game.playerManager.getSheriffPlayerId()
    // ) {
    //   await this.game.gameMap.moveForcePrivate({
    //     force: carriage,
    //   });
    // } else {
    //   await this.game.gameMap.moveCarriagePublic({
    //     hidden: carriage.hidden,
    //     type: carriage.hidden ? null : carriage.type,
    //     toSpaceId,
    //     fromSpaceId,
    //   });
    // }
  }

  async notif_moveCarriagePrivate(notif: Notif<NotifMoveCarriagePrivateArgs>) {
    const { carriage, henchman, toSpaceId } = notif.args;

    const promises = [
      this.game.gameMap.moveForcePrivate({
        force: carriage,
      }),
    ];
    if (henchman) {
      promises.push(this.game.gameMap.moveForcePrivate({ force: henchman }));
    }

    await Promise.all(promises);
  }

  async notif_moveForces(notif: Notif<NotifMoveForcesArgs>) {
    const { forces, toSpaceId, type } = notif.args;
    // const element = this.game.forceManager.getCardElement(forces[0]);
    // const fromRect = element?.getBoundingClientRect();
    // console.log('fromRect in notif', fromRect);
    await this.game.gameMap.forces[`${type}_${toSpaceId}`].addCards(forces);
  }

  async notif_moveRoyalFavourMarker(
    notif: Notif<NotifMoveRoyalFavourMarkerArgs>
  ) {
    const { marker, scores } = notif.args;

    Object.entries(scores).forEach(([playerId, score]) => {
      if (this.game.framework().scoreCtrl?.[playerId]) {
        this.game.framework().scoreCtrl[playerId].setValue(Number(score));
      }
    });
    await this.game.gameMap.moveMarker({
      id: marker.id,
      location: marker.location,
    });
  }

  async notif_moveRoyalInspectionMarker(
    notif: Notif<NotifMoveRoyalInspectionMarkerArgs>
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

  async notif_placeCardInTravellersDeck(
    notif: Notif<NotifPlaceCardInTravellersDeckArgs>
  ) {
    const { card } = notif.args;
    this.game.travellersInfoPanel.travellers[TRAVELLERS_DECK].addCard(card);
  }

  async notif_placeForce(notif: Notif<NotifPlaceForceArgs>) {
    const { force, spaceId, count, playerId } = notif.args;
    const type = this.game.gameMap.getPublicType({ type: force.type });
    const troopSide = this.game.gameMap.isRobinHoodForce({ type: force.type })
      ? 'RobinHood'
      : 'Sheriff';
    this.getPlayer({ playerId }).counters[troopSide][type]?.incValue(-1);
    this.game.gameMap.addPublicForces({
      spaceId,
      count,
      hidden: force.hidden,
      type: force.type,
    });
  }

  async notif_placeForceAll(notif: Notif<NotifPlaceForceAllArgs>) {
    const { forces, playerId } = notif.args;

    forces.forEach((force) => {
      const troopSide = this.game.gameMap.isRobinHoodForce({ type: force.type })
        ? 'RobinHood'
        : 'Sheriff';
      this.getPlayer({ playerId }).counters[troopSide][force.type]?.incValue(
        -1
      );
      this.game.gameMap.addPrivateForce({ force });
    });
  }

  async notif_placeForcePrivate(notif: Notif<NotifPlaceForcePrivateArgs>) {
    const { forces, playerId } = notif.args;

    forces.forEach((force) => {
      const troopSide = this.game.gameMap.isRobinHoodForce({ type: force.type })
        ? 'RobinHood'
        : 'Sheriff';
      this.getPlayer({ playerId }).counters[troopSide][force.type]?.incValue(
        -1
      );
      this.game.gameMap.addPrivateForce({ force });
    });
  }

  async notif_placeMerryMenPublic(notif: Notif<NotifPlaceMerryMenArgs>) {
    const { merryMenCounts, playerId } = notif.args;
    Object.entries(merryMenCounts).forEach(([spaceId, countHidden]) => {
      this.getPlayer({ playerId }).counters.RobinHood[MERRY_MEN]?.incValue(
        -countHidden
      );
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
    const { robinHood, merryMen, playerId } = notif.args;
    const player = this.getPlayer({ playerId });
    if (
      robinHood &&
      !this.game.gameMap.forceIsInLocation({ force: robinHood })
    ) {
      player.counters.RobinHood[ROBIN_HOOD]?.incValue(-1);
      this.game.gameMap.addPrivateForce({ force: robinHood });
    }
    merryMen.forEach((merryMan) => {
      if (!this.game.gameMap.forceIsInLocation({ force: merryMan })) {
        player.counters.RobinHood[MERRY_MEN]?.incValue(-1);
        this.game.gameMap.addPrivateForce({ force: merryMan });
      }
    });
  }

  async notif_putCardInVictimsPile(
    notif: Notif<NotifPutCardInVictimsPileArgs>
  ) {
    const { card, fromLocation } = notif.args;

    // if (fromLocation === TRAVELLERS_DECK) {
    //   this.game.cardArea.incTravellerInDeckCounterValue(
    //     card.id.split('_')[1],
    //     -1
    //   );
    // } else if (fromLocation === TRAVELLERS_DISCARD) {
    //   this.game.cardArea.counters.travellersDiscard.incValue(-1);
    // }
    await Promise.all([
      this.game.cardArea.stocks.travellerRobbed.removeCard(card),
      this.game.travellersInfoPanel.travellers[TRAVELLERS_VICTIMS_PILE].addCard(
        card
      ),
    ]);
  }

  async notif_putTravellerInDiscardPile(
    notif: Notif<NotifPutTravellerInDiscardPileArgs>
  ) {
    const { card } = notif.args;

    await Promise.all([
      this.game.cardArea.stocks.travellerRobbed.removeCard(card),
      this.game.travellersInfoPanel.travellers[TRAVELLERS_DISCARD].addCard(
        card
      ),
    ]);
  }

  async notif_parishStatus(notif: Notif<NotifParishStatusArgs>) {
    const { spaceId, status } = notif.args;
    this.game.gameMap.setSpaceStatus({ spaceId, status });
  }

  async notif_redeploymentSheriff(notif: Notif<NotifRedeploymentSheriffArgs>) {
    const { forces, isTemporaryTruce, carriages } = notif.args;

    const promises = [];
    // TODO: check if already in destination for sheriff player?
    forces.forEach((force) => {
      promises.push(
        this.game.gameMap.forces[`${HENCHMEN}_${force.location}`].addCard(force)
      );
    });

    await Promise.all(promises);
    if (!isTemporaryTruce) {
      this.game.gameMap.forces[`${CARRIAGE}_${USED_CARRIAGES}`].removeAll();
      const isSheriff = this.currentPlayerIsSheriff();
      if (isSheriff) {
        carriages.forEach((carriage) => {
          this.game.playerManager
            .getSheriffPlayer()
            .counters.Sheriff[carriage.type].incValue(1);
        });
      } else {
        this.game.playerManager
          .getSheriffPlayer()
          .counters.Sheriff.Carriage.incValue(carriages.length);
      }
    }
  }

  async notif_removeCardFromGame(notif: Notif<NotifRemoveCardFromGameArgs>) {
    const { card, fromLocation } = notif.args;
    // await this.game.cardManager.removeCard(card); 
    switch (fromLocation) {
      case TRAVELLERS_DECK:
        await this.game.travellersInfoPanel.travellers[
          TRAVELLERS_DECK
        ].removeCard(card);
        return;
      case TRAVELLERS_DISCARD:
        await this.game.travellersInfoPanel.travellers[
          TRAVELLERS_DISCARD
        ].removeCard(card);
        return;
      case TRAVELLERS_VICTIMS_PILE:
        await this.game.travellersInfoPanel.travellers[
          TRAVELLERS_VICTIMS_PILE
        ].removeCard(card);
        return;
    }
  }

  async notif_removeForceFromGamePublic(notif: Notif<NotifReturnToSupplyArgs>) {
    const { force, spaceId } = notif.args;
    await this.game.gameMap.removeFromGamePublic({
      type: force.type,
      hidden: force.hidden,
      fromSpaceId: spaceId,
    });
  }

  async notif_removeForceFromGamePrivate(
    notif: Notif<NotifReturnToSupplyPrivateArgs>
  ) {
    const { force } = notif.args;
    await this.game.forceManager.removeCard(force);
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

  async notif_returnToSupplyPublic(notif: Notif<NotifReturnToSupplyArgs>) {
    const { force, spaceId, playerId } = notif.args;
    const player = this.getPlayer({ playerId });

    if (this.game.getPlayerId() === playerId) {
      const troopSide = this.game.gameMap.isRobinHoodForce({ type: force.type })
        ? 'RobinHood'
        : 'Sheriff';
      player.counters[troopSide]?.[force.type]?.incValue(1);
    } else {
      const type = this.game.gameMap.getPublicType({ type: force.type });
      player.counters[
        this.game.gameMap.isRobinHoodForce({ type }) ? 'RobinHood' : 'Sheriff'
      ]?.[type]?.incValue(1);
    }
    await this.game.gameMap.returnToSupplyPublic({
      type: force.type,
      hidden: force.hidden,
      fromSpaceId: spaceId,
    });
  }

  async notif_returnToSupplyPrivate(
    notif: Notif<NotifReturnToSupplyPrivateArgs>
  ) {
    const { force, playerId } = notif.args;
    await this.game.forceManager.removeCard(force);
    const troopSide = this.game.gameMap.isRobinHoodForce({ type: force.type })
      ? 'RobinHood'
      : 'Sheriff';
    const player =
      troopSide === 'RobinHood'
        ? this.game.playerManager.getRobinHoodPlayer()
        : this.game.playerManager.getSheriffPlayer();
    player.counters[troopSide]?.[force.type]?.incValue(1);
  }

  async notif_sneakMerryMenPrivate(
    notif: Notif<NotifSneakMerryMenPrivateArgs>
  ) {
    const { forces, toSpaceId } = notif.args;

    await this.game.gameMap.forces[`${MERRY_MEN}_${toSpaceId}`].addCards(
      forces
    );
  }

  async notif_moveMerryMenPrivate(notif: Notif<NotifMoveMerryMenPrivateArgs>) {
    const { forces } = notif.args;

    const promises = forces.map((force) => {
      const stock = this.game.gameMap.forces[`${MERRY_MEN}_${force.location}`];
      const merryMan = stock
        .getCards()
        .find((stockForce) => stockForce.id === force.id);
      if (!merryMan) {
        return stock.addCard(force);
      } else {
        return this.game.forceManager.updateCardInformations(force);
      }
    });

    await Promise.all(promises);
  }

  async notif_moveMerryMenPublic(notif: Notif<NotifMoveMerryMenPublicArgs>) {
    const { moves } = notif.args;
    const selectedForces: GestForce[] = [];
    const promises = [];

    moves.forEach((move) => {
      const selectedForce = this.game.gameMap.getForcePublic({
        type: move.from.type,
        spaceId: move.from.spaceId,
        hidden: move.from.hidden,
        exclude: selectedForces,
      });
      selectedForce.type = move.to.type;
      selectedForce.hidden = move.to.hidden;
      const stock = this.game.gameMap.forces[`${MERRY_MEN}_${move.to.spaceId}`];
      if (move.from.type === ROBIN_HOOD && move.to.type === MERRY_MEN) {
        this.game.forceManager.updateCardInformations(selectedForce, {
          updateBack: true,
        });
      }
      if (move.from.spaceId === move.to.spaceId) {
        promises.push(
          this.game.forceManager.updateCardInformations(selectedForce, {
            updateBack: true,
          })
        );
      } else {
        promises.push(stock.addCard(selectedForce));
      }
      selectedForces.push(selectedForce);
    });

    await Promise.all(promises);
    // const promises = forces.map((force) =>
    //   this.game.gameMap.forces[`${MERRY_MEN}_${force.location}`].addCard(force)
    // );

    // await Promise.all(promises);
  }

  async notif_returnTravellersDiscardToMainDeck(
    notif: Notif<NotifReturnTravellersDiscardToMainDeckArgs>
  ) {
    const { cards } = notif.args;
    await this.game.travellersInfoPanel.travellers[TRAVELLERS_DECK].addCards(
      cards
    );
    // cards.forEach((card) => {
    //   this.game.cardArea.counters.travellersDiscard.incValue(-1);
    //   this.game.cardArea.incTravellerInDeckCounterValue(
    //     card.id.split('_')[1],
    //     1
    //   );
    //   this.game.cardArea.counters.travellersDeck.incValue(1);
    // });
  }

  async notif_robTakeTwoShillingsFromTheSheriff(
    notif: Notif<NotifRobTakeTwoShillingsFromTheSheriffArgs>
  ) {
    const { playerId, sheriffPlayerId, amount } = notif.args;
    this.getPlayer({ playerId: sheriffPlayerId }).counters.shillings.incValue(
      -amount
    );
    this.getPlayer({ playerId }).counters.shillings.incValue(amount);
  }

  async notif_sneakMerryMen(notif: Notif<NotifSneakMerryMenArgs>) {
    const { moves, fromSpaceId: spaceId, toSpaceId } = notif.args;

    const forces: GestForce[] = [];
    let robinHoodPublic: GestForce | null = null;

    for (let i = 0; i < moves.hide; i++) {
      const selectedRevealedForce = this.game.gameMap.getForcePublic({
        type: MERRY_MEN,
        spaceId,
        hidden: false,
        exclude: forces,
      });
      selectedRevealedForce.hidden = true;
      forces.push(selectedRevealedForce);
    }
    for (let j = 0; j < moves.reveal; j++) {
      const selectedHiddenForce = this.game.gameMap.getForcePublic({
        type: MERRY_MEN,
        spaceId,
        hidden: true,
        exclude: forces,
      });
      selectedHiddenForce.hidden = false;
      forces.push(selectedHiddenForce);
    }
    for (let k = 0; k < moves.noChange.hidden; k++) {
      const selectedHiddenForce = this.game.gameMap.getForcePublic({
        type: MERRY_MEN,
        spaceId,
        hidden: true,
        exclude: forces,
      });
      forces.push(selectedHiddenForce);
    }
    for (let l = 0; l < moves.noChange.revealed; l++) {
      const selectedHiddenForce = this.game.gameMap.getForcePublic({
        type: MERRY_MEN,
        spaceId,
        hidden: false,
        exclude: forces,
      });
      forces.push(selectedHiddenForce);
    }
    if (moves.robinHood) {
      const revealRobinHood = moves.robinHood === 'reveal';
      const robinHood = this.game.gameMap.getForcePublic({
        type: revealRobinHood ? MERRY_MEN : ROBIN_HOOD,
        spaceId,
        hidden: revealRobinHood ? true : false,
        exclude: forces,
      });
      robinHoodPublic = robinHood;
      if (revealRobinHood) {
        robinHood.hidden = false;
        robinHood.type = ROBIN_HOOD;
      } else if (moves.robinHood === 'hide') {
        robinHood.hidden = true;
        robinHood.type = MERRY_MEN;
      }
      if (robinHoodPublic && moves.robinHood === 'hide') {
        document
          .getElementById(`${robinHoodPublic.id}-front`)
          .setAttribute('data-type', MERRY_MEN);
        const back = document.getElementById(`${robinHoodPublic.id}-back`);
        back.setAttribute('data-type', MERRY_MEN);
        back.replaceChildren();
      } else if (robinHoodPublic && moves.robinHood === 'reveal') {
        document
          .getElementById(`${robinHoodPublic.id}-front`)
          .setAttribute('data-type', ROBIN_HOOD);
        document
          .getElementById(`${robinHoodPublic.id}-back`)
          .setAttribute('data-type', ROBIN_HOOD);
      }
      forces.push(robinHood);
    }

    await this.game.gameMap.forces[`${MERRY_MEN}_${toSpaceId}`].addCards(
      forces
    );
  }

  async notif_startOfRound(notif: Notif<NotifStartOfRoundArgs>) {
    const { balladNumber, eventNumber } = notif.args;
    this.game.infoPanel.updateBalladInfo({ balladNumber, eventNumber });
    if (eventNumber === 1) {
      this.game.infoPanel.updateFortuneEventRevealed(false);
    }
  }
}
