// const campDisplay = (
//   element: HTMLElement,
//   cards: GestForce[],
//   lastCard: GestForce,
//   stock: ManualPositionStock<GestForce>
// ) => {
//   cards.forEach((force, index) => {
//     const forceDiv = stock.getCardElement(force);
//     // forceDiv.style.position = 'absolute';

//     const positions: {top: number; left: number; zIndex: number;}[] = [
//       {
//         top: 0,
//         left: 0,
//         zIndex: 0,
//       },
//       {
//         top: -48,
//         left: 28,
//         zIndex: 0,
//       },
//     ]

//     forceDiv.style.top = `calc(var(--gestForceScale) * ${
//       positions[index > 1 ? 0 : index].top
//     }px)`;
//     forceDiv.style.left = `calc(var(--gestForceScale) * ${
//       positions[index > 1 ? 0 : index].left
//     }px)`;
//     forceDiv.style.zIndex = positions[index].zIndex + '';
//   });
// }

// const carriageDisplay = (
//   element: HTMLElement,
//   cards: GestForce[],
//   lastCard: GestForce,
//   stock: ManualPositionStock<GestForce>
// ) => {
//   cards.forEach((force, index) => {
//     const forceDiv = stock.getCardElement(force);
//     // forceDiv.style.position = 'absolute';

//     const positions: {top: number; left: number; zIndex: number;}[] = [
//       {
//         top: 0,
//         left: 0,
//         zIndex: 0,
//       },
//       {
//         top: -48,
//         left: 20,
//         zIndex: 0,
//       },
//     ]

//     forceDiv.style.top = `calc(var(--gestForceScale) * ${
//       positions[index > 1 ? 0 : index].top
//     }px)`;
//     forceDiv.style.left = `calc(var(--gestForceScale) * ${
//       positions[index > 1 ? 0 : index].left
//     }px)`;
//     forceDiv.style.zIndex = positions[index].zIndex + '';
//   });
// }

// const merryMenDisplay = (
//   element: HTMLElement,
//   cards: GestForce[],
//   lastCard: GestForce,
//   stock: ManualPositionStock<GestForce>
// ) => {
//   cards.forEach((force, index) => {
//     const forceDiv = stock.getCardElement(force);
//     // forceDiv.style.position = 'absolute';

//     const positions: {top: number; left: number; zIndex: number;}[] = [
//       {
//         top: 0,
//         left: 0,
//         zIndex: 0,
//       },
//       {
//         top: 23,
//         left: -20,
//         zIndex: 0,
//       },
//       {
//         top: 23,
//         left: 20,
//         zIndex: 1,
//       },
//       {
//         top: 46,
//         left: 0,
//         zIndex: 2,
//       },
//       {
//         top: 0,
//         left: 40,
//         zIndex: 0,
//       },
//       {
//         top: 46,
//         left: 40,
//         zIndex: 2,
//       },
//       {
//         top: 23,
//         left: 60,
//         zIndex: 1,
//       },
//       {
//         top: 0,
//         left: 80,
//         zIndex: 0,
//       },
//       {
//         top: 46,
//         left: 80,
//         zIndex: 2,
//       },
//       {
//         top: 23,
//         left: 100,
//         zIndex: 1,
//       },
//       {
//         top: 0,
//         left: 120,
//         zIndex: 0,
//       }
//       // {
//       //   top: 0,
//       //   left: 0,
//       //   zIndex: 0,
//       // },
//       // {
//       //   top: 29,
//       //   left: -25,
//       //   zIndex: 0,
//       // },
//       // {
//       //   top: 29,
//       //   left: 25,
//       //   zIndex: 1,
//       // },
//       // {
//       //   top: 58,
//       //   left: 0,
//       //   zIndex: 2,
//       // },
//       // {
//       //   top: 0,
//       //   left: 50,
//       //   zIndex: 0,
//       // },
//       // {
//       //   top: 58,
//       //   left: 50,
//       //   zIndex: 2,
//       // },
//       // {
//       //   top: 29,
//       //   left: 75,
//       //   zIndex: 1,
//       // },
//       // {
//       //   top: 0,
//       //   left: 100,
//       //   zIndex: 0,
//       // },
//       // {
//       //   top: 58,
//       //   left: 100,
//       //   zIndex: 2,
//       // },
//       // {
//       //   top: 29,
//       //   left: 125,
//       //   zIndex: 1,
//       // },
//       // {
//       //   top: 0,
//       //   left: 150,
//       //   zIndex: 0,
//       // }
//     ]

//     forceDiv.style.top = `calc(var(--gestForceScale) * ${
//       positions[index].top
//     }px)`;
//     forceDiv.style.left = `calc(var(--gestForceScale) * ${
//       positions[index].left
//     }px)`;
//     forceDiv.style.zIndex = positions[index].zIndex + '';
//   });
// }

// const henchmenDisplay = (
//   element: HTMLElement,
//   cards: GestForce[],
//   lastCard: GestForce,
//   stock: ManualPositionStock<GestForce>
// ) => {
//   cards.forEach((force, index) => {
//     const forceDiv = stock.getCardElement(force);
//     // forceDiv.style.position = 'absolute';

//     const positions: {top: number; left: number; zIndex: number;}[] = [
//       {
//         top: 0,
//         left: 0,
//         zIndex: 0,
//       },
//       {
//         top: 30,
//         left: -20,
//         zIndex: 1,
//       },
//       {
//         top: 0,
//         left: 40,
//         zIndex: 0,
//       },
//       {
//         top: 30,
//         left: 20,
//         zIndex: 1,
//       },
//       {
//         top: 60,
//         left: 0,
//         zIndex: 2,
//       },
//       {
//         top: 60,
//         left: 40,
//         zIndex: 2,
//       },
//       {
//         top: 30,
//         left: 60,
//         zIndex: 1,
//       },
//       {
//         top: 90,
//         left: 20,
//         zIndex: 3,
//       },
//       {
//         top: 0,
//         left: 80,
//         zIndex: 0,
//       },
//       {
//         top: 90,
//         left: 60,
//         zIndex: 3,
//       },
//       {
//         top: 60,
//         left: 80,
//         zIndex: 2,
//       },
//       {
//         top: 30,
//         left: 100,
//         zIndex: 1,
//       },
//       {
//         top: 0,
//         left: 120,
//         zIndex: 0,
//       },
//       {
//         top: 90,
//         left: 100,
//         zIndex: 3,
//       },
//       {
//         top: 60,
//         left: 120,
//         zIndex: 2,
//       },
//       {
//         top: 30,
//         left: 140,
//         zIndex: 1,
//       },
//       {
//         top: 0,
//         left: 160,
//         zIndex: 0,
//       },
//       {
//         top: 0,
//         left: -40,
//         zIndex: 0,
//       },
//     ]

//     forceDiv.style.top = `calc(var(--gestForceScale) * ${
//       positions[index].top
//     }px)`;
//     forceDiv.style.left = `calc(var(--gestForceScale) * ${
//       positions[index].left
//     }px)`;
//     forceDiv.style.zIndex = positions[index].zIndex + '';
//   });
// }