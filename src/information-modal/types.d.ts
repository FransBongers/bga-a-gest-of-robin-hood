type TabId = 'cardsInfo' | 'orderJustice' | 'robSummary' | 'travellers' | 'royalInspectionRound';

interface TravellerInfo {
  name: string;
  inDeck: string;
  defense: number;
  success: string;
  failure: string;
  extraText?: string;
  image: string;
}

// interface OperationsOneShotsInfoRow {
//   icons: string[];
//   target: string;
//   requirement?: string;
//   effect: string;
// }

// interface BattleTableRow {
//   type: {
//     iconType: 'operation' | 'oneShot';
//     text: string;
//     icons: string[];
//   },
//   attacker: string[];
//   defender: string[];
//   victorPlacement: string[];
//   nonStrawman: string;
//   strawman: string;
// }