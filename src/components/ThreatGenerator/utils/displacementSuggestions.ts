import { ThreatSize } from '../../../interfaces/ThreatSheet';

export type DisplacementPosture = 'Bípede' | 'Quadrúpede';
export type DisplacementPace = 'Lento' | 'Normal' | 'Rápido';

export interface DisplacementSuggestion {
  value: string;
  label: string;
  posture: DisplacementPosture;
  pace: DisplacementPace;
}

type SizeBucket = 'pequenoOuMenor' | 'medio' | 'grandeOuMaior';

const sizeToBucket: Record<ThreatSize, SizeBucket> = {
  [ThreatSize.MINUSCULO]: 'pequenoOuMenor',
  [ThreatSize.PEQUENO]: 'pequenoOuMenor',
  [ThreatSize.MEDIO]: 'medio',
  [ThreatSize.GRANDE]: 'grandeOuMaior',
  [ThreatSize.ENORME]: 'grandeOuMaior',
  [ThreatSize.COLOSSAL]: 'grandeOuMaior',
};

// Cada quadrado em mesa equivale a 1,5m. O texto canônico no Tormenta 20
// é "Nm (Mq)", onde M = N / 1,5.
const formatDisplacement = (meters: number): string => {
  const squares = meters / 1.5;
  const metersText = Number.isInteger(meters)
    ? `${meters}m`
    : `${meters.toString().replace('.', ',')}m`;
  const squaresText = Number.isInteger(squares)
    ? `${squares}q`
    : `${squares.toString().replace('.', ',')}q`;
  return `${metersText} (${squaresText})`;
};

const buildSuggestion = (
  meters: number,
  posture: DisplacementPosture,
  pace: DisplacementPace
): DisplacementSuggestion => {
  const value = formatDisplacement(meters);
  return { value, label: `${value} · ${pace}`, posture, pace };
};

const suggestionsByBucket: Record<SizeBucket, DisplacementSuggestion[]> = {
  pequenoOuMenor: [
    buildSuggestion(4.5, 'Bípede', 'Lento'),
    buildSuggestion(6, 'Bípede', 'Normal'),
    buildSuggestion(9, 'Bípede', 'Rápido'),
    buildSuggestion(6, 'Quadrúpede', 'Lento'),
    buildSuggestion(9, 'Quadrúpede', 'Normal'),
    buildSuggestion(12, 'Quadrúpede', 'Rápido'),
  ],
  medio: [
    buildSuggestion(6, 'Bípede', 'Lento'),
    buildSuggestion(9, 'Bípede', 'Normal'),
    buildSuggestion(12, 'Bípede', 'Rápido'),
    buildSuggestion(9, 'Quadrúpede', 'Lento'),
    buildSuggestion(12, 'Quadrúpede', 'Normal'),
    buildSuggestion(15, 'Quadrúpede', 'Rápido'),
  ],
  grandeOuMaior: [
    buildSuggestion(9, 'Bípede', 'Lento'),
    buildSuggestion(12, 'Bípede', 'Normal'),
    buildSuggestion(15, 'Bípede', 'Rápido'),
    buildSuggestion(12, 'Quadrúpede', 'Lento'),
    buildSuggestion(15, 'Quadrúpede', 'Normal'),
    buildSuggestion(18, 'Quadrúpede', 'Rápido'),
  ],
};

const defaultMetersBySize: Record<ThreatSize, number> = {
  [ThreatSize.MINUSCULO]: 6,
  [ThreatSize.PEQUENO]: 6,
  [ThreatSize.MEDIO]: 9,
  [ThreatSize.GRANDE]: 12,
  [ThreatSize.ENORME]: 15,
  [ThreatSize.COLOSSAL]: 15,
};

export const getDefaultDisplacement = (size?: ThreatSize): string => {
  if (!size) return '';
  return formatDisplacement(defaultMetersBySize[size]);
};

export const getDisplacementSuggestions = (
  size?: ThreatSize
): DisplacementSuggestion[] => {
  if (!size) return [];
  const bucket = sizeToBucket[size];
  return suggestionsByBucket[bucket] ?? [];
};
