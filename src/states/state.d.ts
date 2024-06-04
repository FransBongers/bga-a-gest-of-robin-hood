interface State {
  onEnteringState: (args: any) => void;
  onLeavingState: () => void;
}

interface CommonArgs {
  optionalAction: boolean;
  previousEngineChoices: number;
  previousSteps: number[];
}

interface OnEnteringConfirmTurnArgs extends CommonArgs {}

/**
 * Game state interfaces
 */

interface OnEnteringChooseActionStateArgs extends CommonArgs {
  event: boolean;
  singlePlot: boolean;
  plotsAndDeeds: boolean;
}

interface OnEnteringMoveCarriageStateArgs extends CommonArgs {
  _private?: {
    options: Record<
      string,
      {
        canBringHenchman: boolean;
        carriage: GestForce;
        from: GestSpace;
        to: GestSpace;
      }
    >;
  };
}

interface OnEnteringRecruitStateArgs extends CommonArgs {}

interface OnEnteringRobStateArgs extends CommonArgs {}

interface OnEnteringSelectDeedStateArgs extends CommonArgs {}

interface OnEnteringSelectPlotStateArgs extends CommonArgs {
  options: Record<string, {
    spaces: GestSpace[];
    numberOfSpaces: number;
    plotName: string;
  }>
}

interface OnEnteringSetupRobinHoodArgs extends CommonArgs {}

interface OnEnteringSneakStateArgs extends CommonArgs {}