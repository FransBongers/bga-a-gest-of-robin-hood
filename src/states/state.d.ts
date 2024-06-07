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

interface OnEnteringHireStateArgs extends CommonArgs {
  options: Record<
    string,
    {
      space: GestSpace;
      action: 'place' | 'submit';
      max: number;
    }
  >;
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

interface OnEnteringPatrolStateArgs extends CommonArgs {
  options: Record<
    string,
    {
      space: GestSpace;
      adjacentHenchmen: GestForce[];
    }
  >;
}

interface RecruitOption {
  space: GestSpace;
  merryMen: GestForce[];
  recruitOptions: string[];
}

interface OnEnteringRecruitStateArgs extends CommonArgs {
  _private: {
    options: Record<string, RecruitOption>;
    robinHoodInSupply: boolean;
  };
}

interface OnEnteringRobStateArgs extends CommonArgs {}

interface OnEnteringSelectDeedStateArgs extends CommonArgs {
  _private: {
    options: Record<string, string>;
  };
}

interface OnEnteringSelectPlotStateArgs extends CommonArgs {
  options: Record<string, string>;
}

interface OnEnteringSetupRobinHoodArgs extends CommonArgs {}

interface OnEnteringSneakStateArgs extends CommonArgs {
  _private: {
    options: Record<
      string,
      {
        adjacentSpaces: GestSpace[];
        space: GestSpace;
        merryMen: GestForce[];
      }
    >;
  };
}
