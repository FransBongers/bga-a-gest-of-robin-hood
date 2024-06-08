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

interface OnEnteringCaptureStateArgs extends CommonArgs {
  spaces: GestSpace[];
}

interface OnEnteringChooseActionStateArgs extends CommonArgs {
  event: boolean;
  singlePlot: boolean;
  plotsAndDeeds: boolean;
}

interface OnEnteringConfiscateStateArgs extends CommonArgs {
  _private: {
    spaces: GestSpace[];
    availableCarriageTypes: string[];
  };
}

interface OnEnteringDonateStateArgs extends CommonArgs {
  spaces: GestSpace[];
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

interface OnEnteringPlaceMerryManInSpaceStateArgs extends CommonArgs {
  _private: {
    spaces: Record<string, GestSpace>;
    robinHoodInSupply: boolean;
    merryMenInSupply: boolean;
  };
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

interface OnEnteringRideStateArgs extends CommonArgs {
  spaces: GestSpace[];
  henchmen: GestForce[];
}

interface RobOption {
  space: GestSpace;
  merryMen: GestForce[];
  carriages: {
    HiddenCarriage: number;
    TallageCarriage: number;
    TrapCarriage: number;
    TributeCarriage: number;
  };
  traveller: boolean;
  treasury: boolean;
}

type RobTargetId =
  | 'traveller'
  | 'treasury'
  | 'HiddenCarriage'
  | 'TallageCarriage'
  | 'TrapCarriage'
  | 'TributeCarriage';

interface OnEnteringRobStateArgs extends CommonArgs {
  _private: {
    options: Record<string, RobOption>;
  };
}

interface OnEnteringSelectDeedStateArgs extends CommonArgs {
  _private: {
    options: Record<string, string>;
  };
}

interface OnEnteringSelectPlotStateArgs extends CommonArgs {
  options: Record<string, string>;
}

interface OnEnteringSelectTravellerCardOptionStateArgs extends CommonArgs {
  card: GestCard;
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

interface OnEnteringSwashbuckleStateArgs extends CommonArgs {
  _private: {
    merryMen: GestForce[];
    robinHoodInPrison: boolean;
    spaces: GestSpace[];
  };
}

interface OnEnteringTurncoatStateArgs extends CommonArgs {
  _private: {
    spaces: GestSpace[];
    robinHoodInSupply: boolean;
  };
}
