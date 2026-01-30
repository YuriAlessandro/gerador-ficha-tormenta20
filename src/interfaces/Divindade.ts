import { GeneralPower } from './Poderes';

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

/**
 * Mapeamento de nomes de divindades em CAPSLOCK para nomes formatados
 */
export const divindadeDisplayNames: Record<DivindadeNames, string> = {
  AHARADAK: 'Aharadak',
  OCEANO: 'Oceano',
  TENEBRA: 'Tenebra',
  VALKARIA: 'Valkaria',
  WYNNA: 'Wynna',
  LENA: 'Lena',
  SSZZAAS: 'Sszzaas',
  THYATIS: 'Thyatis',
  ARSENAL: 'Arsenal',
  TANNATOH: 'Tanna-Toh',
  ALLIHANNA: 'Allihanna',
  MARAH: 'Marah',
  KALLYADRANOCH: 'Kallyadranoch',
  KHALMYR: 'Khalmyr',
  THWOR: 'Thwor',
  HYNINN: 'Hyninn',
  AZGHER: 'Azgher',
  LINWU: 'Lin-Wu',
  MEGALOKK: 'Megalokk',
  NIMB: 'Nimb',
};
export default interface Divindade {
  name: string;
  poderes: GeneralPower[];
}

export type FaithProbability = {
  [key in DivindadeNames]?: number;
};
