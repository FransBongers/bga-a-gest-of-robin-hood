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
  track: {
    event: boolean;
    singlePlot: boolean;
    plotsAndDeeds: boolean;
  };
  canResolveEvent: boolean;
}

interface OnEnteringConfiscateStateArgs extends CommonArgs {
  _private: {
    spaces: GestSpace[];
    availableCarriageTypes: string[];
  };
}

interface DisperseTarget {
  type: string;
  hidden: boolean;
}

interface DisperseOption {
  space: GestSpace;
  camps: DisperseTarget[];
  merryMen: DisperseTarget[];
}

interface OnEnteringDisperseStateArgs extends CommonArgs {
  options: Record<string, DisperseOption>;
}

interface OnEnteringDonateStateArgs extends CommonArgs {
  spaces: GestSpace[];
}

interface OnEnteringEventAmbushDarkStateArgs extends CommonArgs {
  options: Record<string, GestSpace>;
}

interface OnEnteringEventATaleOfTwoLoversLightStateArgs extends CommonArgs {
  _private: Record<
    string,
    {
      space: GestSpace;
      merryMen: GestForce[];
      henchmen: GestForce[];
    }
  >;
}

interface OnEnteringEventGuyOfGisborneStateArgs extends CommonArgs {
  _private: {
    merryMen: GestForce[];
  };
}

interface OnEnteringEventLittleJohnStateArgs extends CommonArgs {
  spaces: GestSpace[];
}

interface OnEnteringEventSelectForcesStateArgs extends CommonArgs {
  _private: {
    forces: GestForce[];
    min: number;
    max: number;
  };
  confirmText: string;
  title: string;
  titleOther: string;
}

interface OnEnteringEventSelectSpaceStateArgs extends CommonArgs {
  spaces: GestSpace[];
  confirmText: string;
  title: string;
  titleOther: string;
}

interface OnEnteringFortuneEventDayOfMarketRobinHoodStateArgs
  extends CommonArgs {
  _private: {
    merryMen: GestForce[];
    amount: number;
  };
}

interface OnEnteringFortuneEventDayOfMarketSheriffStateArgs extends CommonArgs {
  henchmen: GestForce[];
  maxNumber: number;
}

interface OnEnteringFortuneEventQueenEleanorStateArgs extends CommonArgs {}

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

interface MoveCarriageOption {
  canBringHenchman: boolean;
  carriage: GestForce;
  from: GestSpace;
  to: GestSpace[];
}

interface OnEnteringMoveCarriageStateArgs extends CommonArgs {
  _private?: {
    options: Record<string, MoveCarriageOption>;
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

interface OnEnteringPlaceHenchmenStateArgs extends CommonArgs {
  henchmen: GestForce[];
  maxNumber: number;
  spaces: Record<string, GestSpace>;
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

interface OnEnteringRemoveCampStateArgs extends CommonArgs {
  camps: GestForce[];
}

interface OnEnteringRemoveTravellerStateArgs extends CommonArgs {
  cardType: string;
  from: string[];
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

interface OnEnteringRoyalInspectionPlaceRobinHoodStateArgs extends CommonArgs {
  _private: {
    spaces: GestSpace[];
  };
}

interface RedeploymentOption {
  henchman: GestForce;
  spaceIds: string[];
}

interface RedeploymentOptionRH {
  merryMan: GestForce;
  spaceIds: string[];
}

interface OnEnteringRoyalInspectionRedeploymentRobinHoodStateArgs
  extends CommonArgs {
  _private: {
    spaces: GestSpace[];
    merryMenMustMove: Record<string, RedeploymentOptionRH>;
    merryMenMayMove: Record<string, RedeploymentOptionRH>;
  };
}

interface OnEnteringRoyalInspectionRedeploymentSheriffStateArgs
  extends CommonArgs {
  spaces: GestSpace[];
  henchmenMustMove: Record<string, RedeploymentOption>;
  henchmenMayMove: Record<string, RedeploymentOption>;
}

interface OnEnteringRoyalInspectionReturnMerryMenFromPrisonStateArgs
  extends CommonArgs {
  _private: {
    merryMen: GestForce[];
    numberToReturn: number;
    robinHoodInPrison: boolean;
  };
}

interface OnEnteringRoyalInspectionSwapRobinHoodStateArgs extends CommonArgs {
  _private: {
    merryMen: GestForce[];
    robinHood: GestForce;
  };
}

interface OnEnteringSelectDeedStateArgs extends CommonArgs {
  _private: {
    options: Record<string, string>;
  };
}

interface OnEnteringSelectEventEffectStateArgs extends CommonArgs {
  card: GestCard;
  canPerformDarkEffect: boolean;
  canPerformLightEffect: boolean;
}

interface OnEnteringSelectPlotStateArgs extends CommonArgs {
  options: Record<string, string>;
  extraOptionId: null | 'gainTwoShillings';
}

interface OnEnteringSelectTravellerCardOptionStateArgs extends CommonArgs {
  card: GestCard;
}

interface OnEnteringSetupRobinHoodArgs extends CommonArgs {}

interface SneakOption {
  adjacentSpaces: GestSpace[];
  space: GestSpace;
  merryMen: GestForce[];
}

interface OnEnteringSneakStateArgs extends CommonArgs {
  _private: {
    options: Record<string, SneakOption>;
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
