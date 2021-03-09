export type DivindadeNames =
  | 'AHARADAK'
  | 'OCEANO'
  | 'TENEBRA'
  | 'VALKARIA'
  | 'WYNNA'
  | 'LENA'
  | 'SSZZAAS'
  | 'THYATIS'
  | 'ARSENAL'
  | 'TANNATOH'
  | 'ALLIHANNA'
  | 'MARAH'
  | 'KALLYADRANOCH'
  | 'KHALMYR'
  | 'THWOR'
  | 'HYNINN'
  | 'AZGHER'
  | 'LINWU'
  | 'MEGALOKK'
  | 'NIMB';

export const allDivindadeNames: DivindadeNames[] = [
  'AHARADAK',
  'OCEANO',
  'TENEBRA',
  'VALKARIA',
  'WYNNA',
  'LENA',
  'SSZZAAS',
  'THYATIS',
  'ARSENAL',
  'TANNATOH',
  'ALLIHANNA',
  'MARAH',
  'KALLYADRANOCH',
  'KHALMYR',
  'THWOR',
  'HYNINN',
  'AZGHER',
  'LINWU',
  'MEGALOKK',
  'NIMB',
];

export default interface Divindade {
  name: string;
  poderes: string[];
}

export type FaithProbability = {
  [key in DivindadeNames]?: number;
};
