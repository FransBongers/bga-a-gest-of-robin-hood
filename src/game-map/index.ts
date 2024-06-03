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
    SPACES.forEach((spaceId) => {
      [CAMP, MERRY_MEN, HENCHMEN, CARRIAGE].forEach((type) => {
        const id = `${lowerCaseFirstLetter(type)}_${spaceId}`;
        const node = document.getElementById(id);
        if (!node) {
          return;
        }
        node.replaceChildren();
      });
    });
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

  updateForces({ gamedatas }: { gamedatas: AGestOfRobinHoodGamedatas }) {
    const isRobinHoodPlayer = !!gamedatas.robinHoodForces;
    const isSheriffPlayer = !!gamedatas.sheriffForces;

    [...SPACES, USED_CARRIAGES].forEach((spaceId) => {
      const forces = gamedatas.forces[spaceId];
      const robinHoodForces = gamedatas.robinHoodForces?.[spaceId];
      const sheriffForces = gamedatas.sheriffForces?.[spaceId];

      if (!forces) {
        return;
      }

      const henchmenBox = document.getElementById(`henchmen_${spaceId}`);
      if (henchmenBox && forces.Henchmen.length > 0) {
        forces.Henchmen.forEach((henchman) => {
          henchmenBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ id: henchman.id, type: henchman.type, hidden: false })
          );
        });
      }
      const merryMenBox = document.getElementById(`merryMen_${spaceId}`);
      if (merryMenBox && !isRobinHoodPlayer) {
        for (let i = 0; i < forces.RobinHood; i++) {
          merryMenBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ type: ROBIN_HOOD, hidden: false })
          );
        }
        for (let k = 0; k < forces.MerryMen.revealed; k++) {
          merryMenBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ type: MERRY_MEN, hidden: false })
          );
        }
        for (let l = 0; l < forces.MerryMen.hidden; l++) {
          merryMenBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ type: MERRY_MEN, hidden: true })
          );
        }
      } else if (merryMenBox && isRobinHoodPlayer && robinHoodForces) {
        robinHoodForces.RobinHood.forEach((robinHood) => {
          merryMenBox.insertAdjacentHTML(
            'beforeend',
            tplForce({
              id: robinHood.id,
              type: robinHood.type,
              hidden: robinHood.hidden,
            })
          );
        });

        robinHoodForces.MerryMen.forEach((merryMen) => {
          merryMenBox.insertAdjacentHTML(
            'beforeend',
            tplForce({
              id: merryMen.id,
              type: merryMen.type,
              hidden: merryMen.hidden,
            })
          );
        });
      }

      const campBox = document.getElementById(`camp_${spaceId}`);
      if (campBox && !isRobinHoodPlayer) {
        for (let i = 0; i < forces.Camp.revealed; i++) {
          campBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ type: CAMP, hidden: false })
          );
        }
        for (let j = 0; j < forces.Camp.hidden; j++) {
          campBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ type: CAMP, hidden: true })
          );
        }
      } else if (campBox && isRobinHoodPlayer && robinHoodForces) {
        robinHoodForces.Camp.forEach((camp) => {
          campBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ id: camp.id, type: camp.type, hidden: camp.hidden })
          );
        });
      }

      const carriageBox = document.getElementById(`carriage_${spaceId}`);
      if (carriageBox && !isSheriffPlayer) {
        [TALLAGE_CARRIAGE, TRAP_CARRIAGE, TRIBUTE_CARRIAGE].forEach(
          (subtype) => {
            this.addPublicForces({
              box: carriageBox,
              count: forces.Carriage[subtype],
              hidden: false,
              type: CARRIAGE,
              subtype,
            });
          }
        );
        this.addPublicForces({
          box: carriageBox,
          count: forces.Carriage.hidden,
          hidden: true,
          type: CARRIAGE,
        });
      } else if (carriageBox && isSheriffPlayer && sheriffForces) {
        sheriffForces.Carriage.forEach((carriage) => {
          carriageBox.insertAdjacentHTML(
            'beforeend',
            tplForce({
              id: carriage.id,
              type: CARRIAGE,
              hidden: carriage.hidden,
              subtype: carriage.type,
            })
          );
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
    this.updateTrackMarkers({ gamedatas });
    this.updateForces({ gamedatas });
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
    box,
    type,
    subtype,
    hidden,
    count,
  }: {
    type: string;
    subtype?: string;
    hidden: boolean;
    count: number;
    box: HTMLElement;
  }) {
    for (let i = 0; i < count; i++) {
      box.insertAdjacentHTML('beforeend', tplForce({ type, hidden, subtype }));
    }
  }

  addRobinHoodPrivate({ robinHood }: { robinHood: GestForce }) {
    const space = document.getElementById(`merryMen_${robinHood.location}`);
    if (!space) {
      return;
    }
    space.insertAdjacentHTML(
      'beforeend',
      tplForce({
        id: robinHood.id,
        type: robinHood.type,
        hidden: robinHood.hidden,
      })
    );
  }

  addMerryManPrivate({ merryMan }: { merryMan: GestForce }) {
    const space = document.getElementById(`merryMen_${merryMan.location}`);
    if (!space) {
      return;
    }
    space.insertAdjacentHTML(
      'beforeend',
      tplForce({
        id: merryMan.id,
        type: merryMan.type,
        hidden: merryMan.hidden,
      })
    );
  }

  addRobinHoodPublic({ spaceId }: { spaceId: string }) {
    const space = document.getElementById(`merryMen_${spaceId}`);
    if (!space) {
      return;
    }

    space.insertAdjacentHTML(
      'beforeend',
      tplForce({ type: ROBIN_HOOD, hidden: false })
    );
  }

  addMerryMenPublic({
    spaceId,
    countHidden = 0,
    countRevealed = 0,
  }: {
    spaceId: string;
    countHidden?: number;
    countRevealed?: number;
  }) {
    const space = document.getElementById(`merryMen_${spaceId}`);
    if (!space) {
      return;
    }
    for (let i = 0; i < countRevealed; i++) {
      space.insertAdjacentHTML(
        'beforeend',
        tplForce({ type: MERRY_MEN, hidden: false })
      );
    }
    for (let k = 0; k < countHidden; k++) {
      space.insertAdjacentHTML(
        'beforeend',
        tplForce({ type: MERRY_MEN, hidden: true })
      );
    }
  }

  async moveCarriagePrivate({
    carriageId,
    toSpaceId,
  }: {
    carriageId: string;
    toSpaceId: string;
  }) {
    const carriageNode = document.getElementById(carriageId);
    const toNode = document.getElementById(`carriage_${toSpaceId}`);

    if (!(carriageNode && toNode)) {
      return;
    }

    await this.game.animationManager.attachWithAnimation(
      new BgaSlideAnimation({ element: carriageNode }),
      toNode
    );
  }

  getCarriageElement({
    spaceId,
    hidden,
    type,
  }: {
    spaceId: string;
    hidden: boolean;
    type: string | null;
  }): HTMLElement | null {
    const carriagesContainer = document.getElementById(`carriage_${spaceId}`);

    if (!carriagesContainer) {
      return null;
    }

    const carriages: HTMLElement[] = [];

    carriagesContainer.childNodes.forEach((element) => {
      if (
        !(element instanceof HTMLElement) ||
        element.getAttribute('data-type') !== CARRIAGE
      ) {
        return;
      }

      const hiddenAttribute = element.getAttribute('data-hidden');
      if (
        (hidden && hiddenAttribute) !== 'true' ||
        (!hidden && hiddenAttribute !== 'false')
      ) {
        return;
      }

      if (type && element.getAttribute('data-subtype') !== type) {
        return;
      }

      carriages.push(element);
    });

    if (carriages.length === 0) {
      return null;
    }

    return carriages[carriages.length - 1];
  }

  async moveCarriagePublic({
    fromSpaceId,
    toSpaceId,
    hidden,
    type,
  }: {
    toSpaceId: string;
    fromSpaceId: string;
    hidden: boolean;
    type: string | null;
  }) {
    console.log('moveCarriagePublic');
    const carriagesContainer = document.getElementById(
      `carriage_${fromSpaceId}`
    );
    const toNode = document.getElementById(`carriage_${toSpaceId}`);
    const carriageNode = this.getCarriageElement({
      spaceId: fromSpaceId,
      hidden,
      type,
    });

    if (!(toNode && carriageNode)) {
      return;
    }

    await this.game.animationManager.attachWithAnimation(
      new BgaSlideAnimation({ element: carriageNode }),
      toNode
    );
  }

  async moveHenchman({
    henchmanId,
    toSpaceId,
  }: {
    henchmanId: string;
    toSpaceId: string;
  }) {
    const node = document.getElementById(henchmanId);
    const toNode = document.getElementById(`henchmen_${toSpaceId}`);

    if (!(node && toNode)) {
      return;
    }

    await this.game.animationManager.attachWithAnimation(
      new BgaSlideAnimation({ element: node }),
      toNode
    );
  }

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
