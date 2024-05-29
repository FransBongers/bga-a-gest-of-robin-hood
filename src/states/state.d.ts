interface State {
  onEnteringState: (args: any) => void;
  onLeavingState: () => void;
}

interface CommonArgs {
  optionalAction: boolean;
  previousEngineChoices: number;
  previousSteps: number[];
}

/**
 * Game state interfaces
 */
