const tuxfordCarriageCoordinates: { row: number; column: number }[] = [
  {
    row: 0,
    column: 0,
  },
  {
    row: 0,
    column: -1,
  },
  {
    row: 2,
    column: -1,
  },
  {
    row: 2,
    column: 0,
  },
  {
    row: 1,
    column: 0,
  },
  {
    row: 1,
    column: -1,
  },
];

// const tuxfordCarriageDisplay = (
//   element: HTMLElement,
//   cards: GestForce[],
//   lastCard: GestForce,
//   stock: ManualPositionStock<GestForce>
// ) => {
//   cards.forEach((force, index) => {
//     const forceDiv = stock.getCardElement(force);

//     const width = 56;
//     const height = 56;

//     const coordinates: { row: number; column: number }[] = [
//       {
//         row: 0,
//         column: 0,
//       },
//       {
//         row: 0,
//         column: -1,
//       },
//       {
//         row: 2,
//         column: -1,
//       },
//       {
//         row: 2,
//         column: 0,
//       },
//       {
//         row: 1,
//         column: 0,
//       },
//       {
//         row: 1,
//         column: -1,
//       },
//     ];
//     const row = coordinates[index]?.row ?? 10;
//     const column = coordinates[index]?.column ?? 10;
//     const top = row * 0.5 * height;
//     const left = column * width - (row % 2) * 0.5 * width;

//     forceDiv.style.top = `calc(var(--gestForceScale) * ${top}px)`;
//     forceDiv.style.left = `calc(var(--gestForceScale) * ${left}px)`;
//     forceDiv.style.zIndex = row + '';
//   });
// };


