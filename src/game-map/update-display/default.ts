const defaultCampPositions: {
  top: number;
  left: number;
  zIndex: number;
}[] = [
  {
    top: 0,
    left: 0,
    zIndex: 0,
  },
  {
    top: -46,
    left: 0,
    zIndex: 0,
  },
];

const defaultCarriageCoordinates: ForceCoordinates[] = [
  {
    row: 0,
    column: 0,
  },
  {
    row: 2,
    column: 0,
  },
  {
    row: 0,
    column: 1,
  },
  {
    row: 2,
    column: 1,
  },
  {
    row: 1,
    column: 1,
  },
  {
    row: 1,
    column: 2,
  },
];

const defaultHenchmenCoordinates: { row: number; column: number }[] = [
  {
    row: 1,
    column: 1,
  },
  {
    row: 2,
    column: 0,
  },
  {
    row: 2,
    column: 1,
  },
  {
    row: 3,
    column: 1,
  },
  {
    row: 1,
    column: 2,
  },
  {
    row: 3,
    column: 2,
  },
  {
    row: 2,
    column: 2,
  },
  // // // Below can overlap?
  {
    row: 3,
    column: 0,
  },
  {
    row: 4,
    column: 0,
  },
  {
    row: 4,
    column: 1,
  },
  {
    row: 4,
    column: 2,
  },
  {
    row: 3,
    column: 3,
  },
  {
    row: 4,
    column: -1,
  },
  {
    row: 5,
    column: 0,
  },
  {
    row: 5,
    column: 1,
  },
  {
    row: 5,
    column: 2,
  },
  {
    row: 5,
    column: 3,
  },
  {
    row: 4,
    column: 3,
  },
];

const defaultMerryMenCoordinates: ForceCoordinates[] = [
  {
    row: 1,
    column: 1,
  },
  {
    row: 2,
    column: 0,
  },
  {
    row: 2,
    column: 1,
  },
  {
    row: 3,
    column: 1,
  },
  {
    row: 1,
    column: 2,
  },
  {
    row: 3,
    column: 2,
  },
  {
    row: 2,
    column: 2,
  },
  {
    row: 3,
    column: 0,
  },
  {
    row: 4,
    column: 0,
  },
  {
    row: 4,
    column: 1,
  },
  {
    row: 1,
    column: 0,
  },
];
