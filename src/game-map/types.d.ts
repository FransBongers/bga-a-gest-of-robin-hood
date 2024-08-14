interface LocationConfig {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TrackConfig {
  id: string | number;
  top: number;
  left: number;
  extraClasses?: string;
}

interface ForceCoordinates {
  row: number;
  column: number;
}

interface ForcePosition {
  top: number;
  left: number;
  zIndex: number;
}
