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
      [CAMP, MERRY_MEN, HENCHMEN].forEach((type) => {
        const node = document.getElementById(`${type}_${spaceId}`);
        if (!node) {
          return;
        }
        node.replaceChildren();
      });
    });
    [ROYAL_FAVOUR_MARKER, ROYAL_INSPECTION_MARKER, ROBIN_HOOD_ELIGIBILITY_MARKER, SHERIFF_ELIGIBILITY_MARKER].forEach((markerId) => {
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

    SPACES.forEach((spaceId) => {
      const forces = gamedatas.forces[spaceId];
      const robinHoodForces = gamedatas.robinHoodForces?.[spaceId];

      if (!forces) {
        return;
      }

      const henchmenBox = document.getElementById(`henchmen_${spaceId}`);
      if (henchmenBox && forces.henchmen.length > 0) {
        forces.henchmen.forEach((henchman) => {
          henchmenBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ id: henchman.id, type: henchman.type, hidden: false })
          );
        });
      }
      const merryMenBox = document.getElementById(`merryMen_${spaceId}`);
      if (merryMenBox && !isRobinHoodPlayer) {
        for (let i = 0; i < forces.robinHood; i++) {
          merryMenBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ type: ROBIN_HOOD, hidden: false })
          );
        }
        for (let k = 0; k < forces.merryMen.revealed; k++) {
          merryMenBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ type: MERRY_MEN, hidden: false })
          );
        }
        for (let l = 0; l < forces.merryMen.hidden; l++) {
          merryMenBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ type: MERRY_MEN, hidden: true })
          );
        }
      } else if (merryMenBox && isRobinHoodPlayer && robinHoodForces) {
        robinHoodForces.robinHood.forEach((robinHood) => {
          merryMenBox.insertAdjacentHTML(
            'beforeend',
            tplForce({
              id: robinHood.id,
              type: robinHood.type,
              hidden: robinHood.hidden,
            })
          );
        });

        robinHoodForces.merryMen.forEach((merryMen) => {
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
        for (let i = 0; i < forces.camp.revealed; i++) {
          campBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ type: CAMP, hidden: false })
          );
        }
        for (let j = 0; j < forces.camp.hidden; j++) {
          campBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ type: CAMP, hidden: true })
          );
        }
      } else if (campBox && isRobinHoodPlayer && robinHoodForces) {
        robinHoodForces.camp.forEach((camp) => {
          campBox.insertAdjacentHTML(
            'beforeend',
            tplForce({ id: camp.id, type: camp.type, hidden: camp.hidden })
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
}
