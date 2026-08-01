import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { LimitBoost } from '../../functions/limitBoost';

/**
 * Indicadores visuais do boost global de limites (meta de 200 apoiadores).
 *
 * Todos os componentes daqui são NO-OP quando o boost está desligado: renderizam
 * `children` intactos (ou `null`), então dá para embrulhar qualquer contador sem
 * condicional no call site.
 *
 * Animação via `sx` + `@keyframes` aninhado — convenção do projeto (não há
 * framer-motion). Tudo respeita `prefers-reduced-motion`.
 */

const EMBER_GRADIENT =
  'linear-gradient(90deg, #ff8a00 0%, #ffcc33 25%, #ff5722 50%, #ffcc33 75%, #ff8a00 100%)';

/** Texto padrão do tooltip: "Limite turbinado! 10 → 15 pela meta de 200 apoiadores". */
export function boostTooltipText(
  baseValue?: number,
  boostedValue?: number
): string {
  const range =
    typeof baseValue === 'number' &&
    typeof boostedValue === 'number' &&
    baseValue > 0 &&
    baseValue !== boostedValue
      ? ` ${baseValue} → ${boostedValue}`
      : '';
  return `Limite turbinado!${range} Recompensa da meta de 200 apoiadores — vale para todo mundo, inclusive contas gratuitas.`;
}

interface BoostFlameProps {
  boost: LimitBoost;
  /** Valor original do limite, para o tooltip "10 → 15". */
  baseValue?: number;
  /** Valor já turbinado. */
  boostedValue?: number;
  fontSize?: 'inherit' | 'small' | 'medium' | 'large';
}

/** Ícone de chama com flicker, explicando o boost no tooltip. */
export const BoostFlame: React.FC<BoostFlameProps> = ({
  boost,
  baseValue,
  boostedValue,
  fontSize = 'small',
}) => {
  if (!boost.active) return null;

  return (
    <Tooltip title={boostTooltipText(baseValue, boostedValue)}>
      <LocalFireDepartmentIcon
        fontSize={fontSize}
        aria-label='Limite turbinado'
        sx={{
          color: '#ff6d00',
          filter: 'drop-shadow(0 0 3px rgba(255, 138, 0, 0.7))',
          verticalAlign: 'middle',
          animation: 'boostFlicker 1.8s ease-in-out infinite',
          '@keyframes boostFlicker': {
            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
            '40%': { opacity: 0.78, transform: 'scale(1.12)' },
            '70%': { opacity: 0.92, transform: 'scale(0.97)' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }}
      />
    </Tooltip>
  );
};

interface BoostedNumberProps {
  boost: LimitBoost;
  children: React.ReactNode;
}

/**
 * Aplica gradiente de brasa animado ao número do limite. Sem boost, devolve
 * `children` sem embrulho nenhum.
 */
export const BoostedNumber: React.FC<BoostedNumberProps> = ({
  boost,
  children,
}) => {
  if (!boost.active) return <>{children}</>;

  return (
    <Box
      component='span'
      sx={{
        fontWeight: 700,
        backgroundImage: EMBER_GRADIENT,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        animation: 'boostEmber 3s linear infinite',
        '@keyframes boostEmber': {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          backgroundImage: 'none',
          color: '#ff6d00',
        },
      }}
    >
      {children}
    </Box>
  );
};

interface BoostHaloProps {
  boost: LimitBoost;
  children: React.ReactNode;
}

/** Halo laranja pulsante no contêiner de um contador turbinado. */
export const BoostHalo: React.FC<BoostHaloProps> = ({ boost, children }) => {
  if (!boost.active) return <>{children}</>;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '8px',
        animation: 'boostHalo 2.4s ease-in-out infinite',
        '@keyframes boostHalo': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 109, 0, 0.28)' },
          '50%': { boxShadow: '0 0 12px 2px rgba(255, 109, 0, 0.28)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      {children}
    </Box>
  );
};

interface BoostedLimitLabelProps {
  boost: LimitBoost;
  /** Texto antes do número, ex.: "12 de ". */
  prefix?: React.ReactNode;
  /** O limite turbinado. */
  max: number;
  /** Limite sem boost, para o tooltip. */
  baseMax?: number;
  /** Texto depois do número, ex.: " fichas de personagem". */
  suffix?: React.ReactNode;
  variant?: 'body2' | 'caption' | 'subtitle2';
  color?: string;
}

/**
 * Linha completa "12 de **15** 🔥 fichas" — atalho para os contadores que
 * seguem esse formato. Sem boost, renderiza texto normal.
 */
export const BoostedLimitLabel: React.FC<BoostedLimitLabelProps> = ({
  boost,
  prefix,
  max,
  baseMax,
  suffix,
  variant = 'body2',
  color,
}) => (
  <Typography
    variant={variant}
    color={color}
    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
  >
    <span>
      {prefix}
      <BoostedNumber boost={boost}>{max}</BoostedNumber>
      {suffix}
    </span>
    <BoostFlame boost={boost} baseValue={baseMax} boostedValue={max} />
  </Typography>
);
