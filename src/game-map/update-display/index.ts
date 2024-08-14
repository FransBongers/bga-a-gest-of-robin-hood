
const campDisplay = (positions: ForcePosition[]) => (
  element: HTMLElement,
  cards: GestForce[],
  lastCard: GestForce,
  stock: ManualPositionStock<GestForce>
) => {
  cards.forEach((force, index) => {
    const forceDiv = stock.getCardElement(force);
    // forceDiv.style.position = 'absolute';

    // const positions: { top: number; left: number; zIndex: number }[] = [
    //   {
    //     top: 0,
    //     left: 0,
    //     zIndex: 0,
    //   },
    //   {
    //     top: -46,
    //     left: 0,
    //     zIndex: 0,
    //   },
    // ];

    forceDiv.style.top = `calc(var(--gestForceScale) * ${
      positions[index > 1 ? 0 : index].top
    }px)`;
    forceDiv.style.left = `calc(var(--gestForceScale) * ${
      positions[index > 1 ? 0 : index].left
    }px)`;
    forceDiv.style.zIndex = positions[index].zIndex + '';
  });
};

const CARRIAGE_WIDTH = 56;
const CARRIAGE_HEIGHT = 56;
const HENCHMAN_WIDTH = 40;
const HENCHMAN_HEIGHT = 50;
const MERRY_MAN_WIDTH = 40;
const MERRY_MAN_HEIGHT = 46;

const forceDisplay = (coordinates: ForceCoordinates[], width: number, height: number) => (
  element: HTMLElement,
  cards: GestForce[],
  lastCard: GestForce,
  stock: ManualPositionStock<GestForce>
) => {
  cards.forEach((force, index) => {
    const forceDiv = stock.getCardElement(force);

    const row = coordinates[index]?.row ?? 10;
    const column = coordinates[index]?.column ?? 10;
    const top = row * 0.5 * height;
    const left = column * width - (row % 2) * 0.5 * width;

    forceDiv.style.top = `calc(var(--gestForceScale) * ${top}px)`;
    forceDiv.style.left = `calc(var(--gestForceScale) * ${left}px)`;
    forceDiv.style.zIndex = row + '';
  });
};


const getDisplayFunction = (spaceId: string, forceType: string) => {
  const displayFunctionMap = {
    [BINGHAM]: {
      [HENCHMEN]: forceDisplay(binghamHenchmenCoordinates, HENCHMAN_WIDTH, HENCHMAN_HEIGHT),
      [MERRY_MEN]: forceDisplay(defaultMerryMenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
      [CAMP]: campDisplay(defaultCampPositions),
      [CARRIAGE]: forceDisplay(binghamCarriageCoordinates, CARRIAGE_WIDTH, CARRIAGE_HEIGHT),
    },
    [BLYTH]: {
      [HENCHMEN]: forceDisplay(defaultHenchmenCoordinates, HENCHMAN_WIDTH, HENCHMAN_HEIGHT),
      [MERRY_MEN]: forceDisplay(defaultHenchmenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
      [CAMP]: campDisplay(defaultCampPositions),
      [CARRIAGE]: forceDisplay(blythCarriageCoordinates, CARRIAGE_WIDTH, CARRIAGE_HEIGHT),
    },
    [MANSFIELD]: {
      [HENCHMEN]: forceDisplay(mansfieldHenchmenCoordinates, HENCHMAN_WIDTH, HENCHMAN_HEIGHT),
      [MERRY_MEN]: forceDisplay(mansfieldMerryMenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
      [CAMP]: campDisplay(defaultCampPositions),
      [CARRIAGE]: forceDisplay(mansfieldCarriageCoordinates, CARRIAGE_WIDTH, CARRIAGE_HEIGHT),
    },
    [NEWARK]: {
      [HENCHMEN]: forceDisplay(newarkHenchmenCoordinates, HENCHMAN_WIDTH, HENCHMAN_HEIGHT),
      [MERRY_MEN]: forceDisplay(defaultMerryMenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
      [CAMP]: campDisplay(defaultCampPositions),
      [CARRIAGE]: forceDisplay(newarkCarriageCoordinates, CARRIAGE_WIDTH, CARRIAGE_HEIGHT),
    },
    [NOTTINGHAM]: {
      [HENCHMEN]: forceDisplay(nottinghamHenchmenCoordinates, HENCHMAN_WIDTH, HENCHMAN_HEIGHT),
      [MERRY_MEN]: forceDisplay(nottinghamMerryMenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
      [CAMP]: campDisplay(defaultCampPositions),
      [CARRIAGE]: forceDisplay(nottinghamCarriageCoordinates, CARRIAGE_WIDTH, CARRIAGE_HEIGHT),
    },
    [OLLERTON_HILL]: {
      [HENCHMEN]: forceDisplay(mansfieldHenchmenCoordinates, HENCHMAN_WIDTH, HENCHMAN_HEIGHT),
      [MERRY_MEN]: forceDisplay(mansfieldMerryMenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
      [CAMP]: campDisplay(defaultCampPositions),
      [CARRIAGE]: forceDisplay(mansfieldCarriageCoordinates, CARRIAGE_WIDTH, CARRIAGE_HEIGHT),
    },
    [REMSTON]: {
      [HENCHMEN]: forceDisplay(defaultHenchmenCoordinates, HENCHMAN_WIDTH, HENCHMAN_HEIGHT),
      [MERRY_MEN]: forceDisplay(defaultMerryMenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
      [CAMP]: campDisplay(defaultCampPositions),
      [CARRIAGE]: forceDisplay(remstonCarriageCoordinates, CARRIAGE_WIDTH, CARRIAGE_HEIGHT),
    },
    [RETFORD]: {
      [HENCHMEN]: forceDisplay(retfordHenchmenCoordinates, HENCHMAN_WIDTH, HENCHMAN_HEIGHT),
      [MERRY_MEN]: forceDisplay(refordMerryMenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
      [CAMP]: campDisplay(defaultCampPositions),
      [CARRIAGE]: forceDisplay(retfordCarriageCoordinates, CARRIAGE_WIDTH, CARRIAGE_HEIGHT),
    },
    [SHIRE_WOOD]: {
      [HENCHMEN]: forceDisplay(shireWoodHenchmenCoordinates, HENCHMAN_WIDTH, HENCHMAN_HEIGHT),
      [MERRY_MEN]: forceDisplay(shireWoodMerryMenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
      [CAMP]: campDisplay(defaultCampPositions),
      [CARRIAGE]: forceDisplay(shireWoodCarriageCoordinates, CARRIAGE_WIDTH, CARRIAGE_HEIGHT),
    },
    [SOUTHWELL_FOREST]: {
      [HENCHMEN]: forceDisplay(southwellForestHenchmenCoordinates, HENCHMAN_WIDTH, HENCHMAN_HEIGHT),
      [MERRY_MEN]: forceDisplay(southwellForestMerryMenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
      [CAMP]: campDisplay(southwellForestCampPositions),
      [CARRIAGE]: forceDisplay(southwellForestCarriageCoordinates, CARRIAGE_WIDTH, CARRIAGE_HEIGHT),
    },
    [TUXFORD]: {
      [HENCHMEN]: forceDisplay(defaultHenchmenCoordinates, HENCHMAN_WIDTH, HENCHMAN_HEIGHT),
      [MERRY_MEN]: forceDisplay(defaultMerryMenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
      [CAMP]: campDisplay(defaultCampPositions),
      [CARRIAGE]: forceDisplay(tuxfordCarriageCoordinates, CARRIAGE_WIDTH, CARRIAGE_HEIGHT),
    },
    [PRISON]: {
      [MERRY_MEN]: forceDisplay(defaultMerryMenCoordinates, MERRY_MAN_WIDTH, MERRY_MAN_HEIGHT),
    }
  };

  return displayFunctionMap[spaceId][forceType];
};