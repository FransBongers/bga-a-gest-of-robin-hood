// ..######......###....##.....##.########....##.....##....###....########.
// .##....##....##.##...###...###.##..........###...###...##.##...##.....##
// .##.........##...##..####.####.##..........####.####..##...##..##.....##
// .##...####.##.....##.##.###.##.######......##.###.##.##.....##.########.
// .##....##..#########.##.....##.##..........##.....##.#########.##.......
// .##....##..##.....##.##.....##.##..........##.....##.##.....##.##.......
// ..######...##.....##.##.....##.########....##.....##.##.....##.##.......

class GameMap {
  protected game: AGestOfRobinHoodGame;

  public parishStatusMarkers: Record<string, LineStock<GestMarker>> = {};
  public forces: Record<string, LineStock<GestForce>> = {};
  private forceIdCounter = 1;

  constructor(game: AGestOfRobinHoodGame) {
    this.game = game;
    const gamedatas = game.gamedatas;

    this.setupGameMap({ gamedatas });
  }

  // .##.....##.##....##.########...#######.
  // .##.....##.###...##.##.....##.##.....##
  // .##.....##.####..##.##.....##.##.....##
  // .##.....##.##.##.##.##.....##.##.....##
  // .##.....##.##..####.##.....##.##.....##
  // .##.....##.##...###.##.....##.##.....##
  // ..#######..##....##.########...#######.

  clearInterface() {
    PARISHES.forEach((parishId) => {
      this.parishStatusMarkers[parishId].removeAll();
    });
    Object.values(this.forces).forEach((stock) => {
      stock.removeAll();
    });

    // SPACES.forEach((spaceId) => {
    //   [CAMP, MERRY_MEN, HENCHMEN, CARRIAGE].forEach((type) => {
    //     const id = `${lowerCaseFirstLetter(type)}_${spaceId}`;
    //     const node = document.getElementById(id);
    //     if (!node) {
    //       return;
    //     }
    //     node.replaceChildren();
    //   });
    // });
    [
      ROYAL_FAVOUR_MARKER,
      ROYAL_INSPECTION_MARKER,
      ROBIN_HOOD_ELIGIBILITY_MARKER,
      SHERIFF_ELIGIBILITY_MARKER,
    ].forEach((markerId) => {
      const node = document.getElementById(markerId);
      if (!node) {
        return;
      }
      node.remove();
    });
  }

  updateInterface({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    this.updateParishStatusMarkers({ gamedatas });
    this.updateTrackMarkers({ gamedatas });
    this.updateForces({ gamedatas });
  }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  setupParishStatusMarkers({
    gamedatas,
  }: {
    gamedatas: AGestOfRobinHoodGamedatas;
  }) {
    PARISHES.forEach((parishId) => {
      this.parishStatusMarkers[parishId] = new LineStock<GestMarker>(
        this.game.markerManager,
        document.getElementById(`parishStatusBox_${parishId}`),
        {
          gap: '0px',
          center: true,
        }
      );
    });

    this.updateParishStatusMarkers({ gamedatas });
  }

  setupForces({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    Object.entries(SPACES_CONFIG).forEach(([spaceId, config]) => {
      Object.keys(config).forEach((forceType) => {
        const id = `${forceType}_${spaceId}`;
        const element = document.getElementById(id);
        if (!element) {
          console.log(id);
          return;
        }
        this.forces[id] = new LineStock<GestForce>(
          this.game.forceManager,
          element,
          {
            center: true,
          }
        );
      });
    });
    this.forces['Carriage_usedCarriages'] = new LineStock<GestForce>(
      this.game.forceManager,
      document.getElementById('Carriage_usedCarriages'),
      {
        center: true,
      }
    );

    this.updateForces({ gamedatas });
  }

  updateForces({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    const isRobinHoodPlayer =
      this.game.getPlayerId() ===
      this.game.playerManager.getRobinHoodPlayerId();
    const isSheriffPlayer =
      this.game.getPlayerId() === this.game.playerManager.getSheriffPlayerId();

    [...SPACES, USED_CARRIAGES].forEach((spaceId) => {
      const forces = gamedatas.forces[spaceId];
      const robinHoodForces = gamedatas.robinHoodForces?.[spaceId];
      const sheriffForces = gamedatas.sheriffForces?.[spaceId];

      if (!forces) {
        return;
      }

      // const henchmenBox = document.getElementById(`henchmen_${spaceId}`);
      if (forces.Henchmen.length > 0) {
        forces.Henchmen.forEach((henchman) => {
          console.log('location', `${henchman.type}_${henchman.location}`);
          this.forces[`${henchman.type}_${henchman.location}`].addCard(
            henchman
          );
        });
      }

      if (isRobinHoodPlayer && robinHoodForces) {
        robinHoodForces.forEach((force) => {
          console.log('isRH');
          this.addPrivateForce({ force });
        });
      }

      if (isSheriffPlayer && sheriffForces) {
        console.log('isSheriff');
        sheriffForces.forEach((carriage) => {
          this.forces[`${CARRIAGE}_${spaceId}`].addCard(carriage);
        });
      }

      if (!isRobinHoodPlayer) {
        // Robin Hood
        this.addPublicForces({
          type: ROBIN_HOOD,
          spaceId,
          hidden: false,
          count: forces.RobinHood,
        });
        // Merry men
        this.addPublicForces({
          type: MERRY_MEN,
          spaceId,
          hidden: false,
          count: forces.MerryMen.revealed,
        });
        this.addPublicForces({
          type: MERRY_MEN,
          spaceId,
          hidden: true,
          count: forces.MerryMen.hidden,
        });
        // Camps
        this.addPublicForces({
          type: CAMP,
          spaceId,
          hidden: false,
          count: forces.Camp.revealed,
        });
        this.addPublicForces({
          type: CAMP,
          spaceId,
          hidden: true,
          count: forces.Camp.hidden,
        });
      }
      if (!isSheriffPlayer) {
        this.addPublicForces({
          count: forces.Carriage.hidden,
          hidden: true,
          type: CARRIAGE,
          spaceId,
        });
        [TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].forEach((type) => {
          this.addPublicForces({
            count: forces.Carriage[type],
            hidden: false,
            type: type,
            spaceId,
          });
        });
      }
    });
  }

  updateParishStatusMarkers({
    gamedatas,
  }: {
    gamedatas: AGestOfRobinHoodGamedatas;
  }) {
    PARISHES.forEach((parishId) => {
      const spaceData = gamedatas.spaces[parishId];
      if (!spaceData) {
        return;
      }
      this.parishStatusMarkers[parishId].addCard({
        id: `parishStatusMarker_${parishId}`,
        location: `parishStatusBox_${parishId}`,
        side: spaceData.status === 'submissive' ? 'front' : 'back',
        type: 'parishStatusMarker',
      });
    });
  }

  updateTrackMarkers({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    GAME_MAP_MARKERS.forEach((markerId) => {
      const data = gamedatas.markers[markerId];
      if (!data) {
        return;
      }

      const location = document.getElementById(data.location);
      if (!location) {
        return;
      }
      location.insertAdjacentHTML(
        'afterbegin',
        tplMarker({ id: data.id, extraClasses: 'gest_track_marker' })
      );
    });
  }

  // Setup functions
  setupGameMap({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    document
      .getElementById('play_area_container')
      .insertAdjacentHTML('afterbegin', tplGameMap({ gamedatas }));

    this.setupParishStatusMarkers({ gamedatas });
    this.setupForces({ gamedatas });
    this.updateTrackMarkers({ gamedatas });
    // this.updateForces({ gamedatas });
  }

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

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  addPublicForces({
    type,
    hidden,
    spaceId,
    count,
  }: {
    type: string;
    hidden: boolean;
    spaceId: string;
    count: number;
  }) {
    for (let i = 0; i < count; i++) {
      let stockId = `${type}_${spaceId}`;
      if (type === ROBIN_HOOD) {
        stockId = `${MERRY_MEN}_${spaceId}`;
      } else if (
        [TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].includes(type)
      ) {
        stockId = `${CARRIAGE}_${spaceId}`;
      }

      this.forces[stockId].addCard({
        id: `force_${this.forceIdCounter}`,
        type: type,
        location: spaceId,
        hidden,
      });
      this.forceIdCounter++;
      // box.insertAdjacentHTML('beforeend', tplForce({ type, hidden, subtype }));
    }
  }

  getStockIdPrivate({ force }: { force: GestForce }) {
    let id = `${force.type}_${force.location}`;
    if (force.type === ROBIN_HOOD) {
      id = `${MERRY_MEN}_${force.location}`;
    } else if (
      [TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].includes(force.type)
    ) {
      id = `${CARRIAGE}_${force.location}`;
    }
    return id;
  }

  getStockIdPublic({ type, spaceId }: { type: string; spaceId: string }) {
    switch (type) {
      case ROBIN_HOOD:
      case MERRY_MEN:
        return `${MERRY_MEN}_${spaceId}`;
      case CAMP:
        return `${CAMP}_${spaceId}`;
      case TALLAGE_CARRIAGE:
      case TRAP_CARRIAGE:
      case TRIBUTE_CARRIAGE:
      case CARRIAGE:
        return `${CARRIAGE}_${spaceId}`;
      default:
        return;
    }
  }

  addPrivateForce({ force }: { force: GestForce }) {
    const id = this.getStockIdPrivate({ force });
    this.forces[id].addCard(force);
  }

  getForcePublic({
    type,
    spaceId,
    hidden,
  }: {
    type: string;
    spaceId: string;
    hidden: boolean;
  }): GestForce {
    const stockId = this.getStockIdPublic({ type, spaceId });

    const forces = this.forces[stockId]
      .getCards()
      .filter((force) => force.hidden === hidden);

    const selected = forces[Math.floor(Math.random() * forces.length)];

    return selected;
  }

  revealForcePublic({ force }: { force: GestForce }) {
    console.log('revealForcePublic');

    const selected = this.getForcePublic({
      type: force.type,
      spaceId: force.location,
      hidden: true,
    });
    console.log('revealForcePublic');

    selected.type = force.type;
    selected.hidden = force.hidden;
    this.game.forceManager.updateCardInformations(selected);
  }

  revealForcePrivate({ force }: { force: GestForce }) {
    this.game.forceManager.updateCardInformations(force);
  }

  async moveForcePrivate({ force }: { force: GestForce }) {
    const toStockId = this.getStockIdPrivate({ force });
    console.log('toStockId', toStockId);
    await this.forces[toStockId].addCard(force);
  }

  async returnToSupplyPublic({
    type,
    hidden,
    fromSpaceId,
  }: {
    type: string;
    hidden: boolean;
    fromSpaceId: string;
  }) {
    const selected = this.getForcePublic({
      type: type,
      spaceId: fromSpaceId,
      hidden,
    });

    await this.game.forceManager.removeCard(selected);
  }

  async moveForcePublic({
    type,
    hidden,
    toSpaceId,
    fromSpaceId,
  }: {
    type: string;
    hidden: boolean;
    fromSpaceId: string;
    toSpaceId: string;
  }) {
    const force = this.getForcePublic({ type, hidden, spaceId: fromSpaceId });

    const toStockId = this.getStockIdPublic({ type, spaceId: toSpaceId });
    console.log('toStockId', toStockId);
    await this.forces[toStockId].addCard(force);
  }

  // getCarriageElement({
  //   spaceId,
  //   hidden,
  //   type,
  // }: {
  //   spaceId: string;
  //   hidden: boolean;
  //   type: string | null;
  // }): HTMLElement | null {
  //   const carriagesContainer = document.getElementById(`carriage_${spaceId}`);

  //   if (!carriagesContainer) {
  //     return null;
  //   }

  //   const carriages: HTMLElement[] = [];

  //   carriagesContainer.childNodes.forEach((element) => {
  //     if (
  //       !(element instanceof HTMLElement) ||
  //       element.getAttribute('data-type') !== CARRIAGE
  //     ) {
  //       return;
  //     }

  //     const hiddenAttribute = element.getAttribute('data-hidden');
  //     if (
  //       (hidden && hiddenAttribute) !== 'true' ||
  //       (!hidden && hiddenAttribute !== 'false')
  //     ) {
  //       return;
  //     }

  //     if (type && element.getAttribute('data-subtype') !== type) {
  //       return;
  //     }

  //     carriages.push(element);
  //   });

  //   if (carriages.length === 0) {
  //     return null;
  //   }

  //   return carriages[carriages.length - 1];
  // }

  // async moveCarriagePublic({
  //   fromSpaceId,
  //   toSpaceId,
  //   hidden,
  //   type,
  // }: {
  //   toSpaceId: string;
  //   fromSpaceId: string;
  //   hidden: boolean;
  //   type: string | null;
  // }) {
  //   console.log('moveCarriagePublic');
  //   const carriagesContainer = document.getElementById(
  //     `carriage_${fromSpaceId}`
  //   );
  //   const toNode = document.getElementById(`carriage_${toSpaceId}`);
  //   const carriageNode = this.getCarriageElement({
  //     spaceId: fromSpaceId,
  //     hidden,
  //     type,
  //   });

  //   if (!(toNode && carriageNode)) {
  //     return;
  //   }

  //   await this.game.animationManager.attachWithAnimation(
  //     new BgaSlideAnimation({ element: carriageNode }),
  //     toNode
  //   );
  // }

  // async moveHenchman({
  //   henchmanId,
  //   toSpaceId,
  // }: {
  //   henchman: G;
  //   toSpaceId: string;
  // }) {
  //   const node = document.getElementById(henchmanId);
  //   const toNode = document.getElementById(`henchmen_${toSpaceId}`);

  //   if (!(node && toNode)) {
  //     return;
  //   }

  //   await this.game.animationManager.attachWithAnimation(
  //     new BgaSlideAnimation({ element: node }),
  //     toNode
  //   );
  // }

  async moveMarker({ id, location }: { id: string; location: string }) {
    const markerNode = document.getElementById(id);
    const toNode = document.getElementById(location);

    if (!(markerNode && toNode)) {
      return;
    }

    await this.game.animationManager.attachWithAnimation(
      new BgaSlideAnimation({ element: markerNode }),
      toNode
    );
  }
}
