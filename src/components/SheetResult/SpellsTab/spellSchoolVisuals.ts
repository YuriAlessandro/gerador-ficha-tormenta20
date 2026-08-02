import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SvgIcon from '@mui/material/SvgIcon';
import { useTheme } from '@mui/material';
import { SpellSchool } from '@/interfaces/Spells';
import {
  AbjuracaoIcon,
  AdivinhacaoIcon,
  ConvocacaoIcon,
  EncantamentoIcon,
  EvocacaoIcon,
  IlusaoIcon,
  NecromanciaIcon,
  TransmutacaoIcon,
} from './spellSchoolIcons';

type SchoolIcon = typeof SvgIcon;

export interface SchoolVisual {
  icon: SchoolIcon;
  /** Valor para tema claro. */
  light: string;
  /** Valor para tema escuro. */
  dark: string;
}

/**
 * Glifo e cor de cada escola. Ponto único da paleta — nada de hex espalhado
 * pelos componentes.
 *
 * As cores ficam FORA do sistema de accent de propósito: o accent do usuário
 * varia entre sete paletas (`primary.main` pode ser vermelho, roxo, navy...),
 * então cor de escola derivada do tema colidiria de forma imprevisível. São
 * oito matizes fixos e bem separados na roda de cor, com um valor por tema
 * para manter ≥3:1 de contraste contra `background.paper` nos dois.
 *
 * A cor NUNCA é o único sinal: a forma do glifo, o tooltip e a escola por
 * extenso no detalhe carregam a informação sozinhos. Requisito de daltonismo.
 */
export const SCHOOL_VISUALS: Record<SpellSchool, SchoolVisual> = {
  Abjur: { icon: AbjuracaoIcon, light: '#2563EB', dark: '#60A5FA' },
  Adiv: { icon: AdivinhacaoIcon, light: '#0891B2', dark: '#22D3EE' },
  Conv: { icon: ConvocacaoIcon, light: '#D97706', dark: '#FBBF24' },
  Encan: { icon: EncantamentoIcon, light: '#DB2777', dark: '#F472B6' },
  Evoc: { icon: EvocacaoIcon, light: '#DC2626', dark: '#F87171' },
  Ilusão: { icon: IlusaoIcon, light: '#7C3AED', dark: '#A78BFA' },
  Necro: { icon: NecromanciaIcon, light: '#65A30D', dark: '#A3E635' },
  Trans: { icon: TransmutacaoIcon, light: '#059669', dark: '#34D399' },
};

/**
 * Magia homebrew ou personalizada pode ter `school` fora do union — o campo é
 * texto livre no diálogo de magia personalizada. Cai num glifo neutro em vez de
 * quebrar.
 */
const UNKNOWN_SCHOOL: SchoolVisual = {
  icon: AutoAwesomeOutlinedIcon,
  light: '#6B7280',
  dark: '#9CA3AF',
};

export const getSchoolVisual = (school: string): SchoolVisual =>
  SCHOOL_VISUALS[school as SpellSchool] ?? UNKNOWN_SCHOOL;

/** Cor da escola já resolvida pelo tema ativo. */
export const useSchoolColor = (school: string): string => {
  const theme = useTheme();
  const visual = getSchoolVisual(school);
  return theme.palette.mode === 'dark' ? visual.dark : visual.light;
};
