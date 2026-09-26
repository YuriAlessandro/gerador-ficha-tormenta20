/**
 * Rolo de caça-níquel: as linhas da tabela passam pela janela e desaceleram
 * até parar na linha sorteada. Só encenação — o resultado já foi calculado.
 *
 * Animação via `transform` + transition (convenção do projeto: `sx`, sem
 * framer-motion). O desligamento (inclusive por `prefers-reduced-motion`) é
 * feito por quem usa o rolo: com a animação desligada ele nem é montado.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export const REEL_DURATION_MS = { major: 1200, minor: 700 } as const;
/** Tempo com a linha descartada riscada antes da próxima rolagem. */
export const REJECT_HOLD_MS = 900;
/** Destaque rápido na linha sorteada antes de revelar o resultado. */
export const SETTLE_HOLD_MS = 180;

const ROW_HEIGHT = { major: 30, minor: 24 } as const;
/** Mínimo de linhas que passam pela janela (tabelas curtas dão mais voltas). */
const MIN_TRAVEL = { major: 22, minor: 14 } as const;
const EASING = 'cubic-bezier(0.12, 0.8, 0.25, 1)';

interface SlotReelProps {
  lines: string[];
  finalIndex: number;
  size: 'major' | 'minor';
  rejectedReason?: string;
  onDone: () => void;
}

const SlotReel: React.FC<SlotReelProps> = ({
  lines,
  finalIndex,
  size,
  rejectedReason,
  onDone,
}) => {
  const theme = useTheme();
  const rowHeight = ROW_HEIGHT[size];
  const duration = REEL_DURATION_MS[size];
  const [running, setRunning] = useState(false);
  const [stopped, setStopped] = useState(false);
  const finished = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Tira: começa numa linha aleatória, dá voltas e termina na sorteada. Há
  // uma linha extra em cada ponta para preencher a janela de 3 linhas.
  const { strip, travel } = useMemo(() => {
    const n = lines.length;
    const start = Math.floor(Math.random() * n);
    const toFinal = (finalIndex - start + n) % n;
    const laps = Math.max(1, Math.ceil((MIN_TRAVEL[size] - toFinal) / n));
    const total = laps * n + toFinal;
    const items: string[] = [];
    for (let k = -1; k <= total + 1; k += 1)
      items.push(lines[(((start + k) % n) + n) % n]);
    return { strip: items, travel: total };
  }, [lines, finalIndex, size]);

  useEffect(() => {
    // Dois frames: o navegador pinta a posição inicial antes da transição.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setRunning(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  // Parou: segura um instante (ou mais, se descartada) e avisa.
  useEffect(() => {
    const stopTimer = setTimeout(() => setStopped(true), duration + 60);
    return () => clearTimeout(stopTimer);
  }, [duration]);

  useEffect(() => {
    if (!stopped) return undefined;
    const timer = setTimeout(
      () => {
        if (finished.current) return;
        finished.current = true;
        onDoneRef.current();
      },
      rejectedReason ? REJECT_HOLD_MS : SETTLE_HOLD_MS
    );
    return () => clearTimeout(timer);
  }, [stopped, rejectedReason]);

  const offset = running ? -travel * rowHeight : 0;

  return (
    <Box aria-hidden sx={{ my: 0.5 }}>
      <Box
        sx={{
          position: 'relative',
          height: rowHeight * 3,
          overflow: 'hidden',
          borderRadius: 1,
          backgroundColor: `${theme.palette.primary.main}0A`,
          maskImage:
            'linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)',
        }}
      >
        {/* Linha de pagamento (a do meio). */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: rowHeight,
            height: rowHeight,
            borderTop: `1px solid ${theme.palette.primary.main}`,
            borderBottom: `1px solid ${theme.palette.primary.main}`,
            backgroundColor: stopped
              ? `${theme.palette[rejectedReason ? 'error' : 'primary'].main}22`
              : 'transparent',
            transition: 'background-color 150ms ease',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            transform: `translateY(${offset}px)`,
            transition: running ? `transform ${duration}ms ${EASING}` : 'none',
            willChange: 'transform',
          }}
        >
          {strip.map((line, k) => {
            const isFinal = k === travel + 1;
            return (
              <Typography
                // eslint-disable-next-line react/no-array-index-key
                key={k}
                variant={size === 'major' ? 'body1' : 'body2'}
                noWrap
                sx={{
                  height: rowHeight,
                  lineHeight: `${rowHeight}px`,
                  px: 1,
                  fontWeight: isFinal && stopped ? 700 : 400,
                  fontVariantNumeric: 'tabular-nums',
                  textDecoration:
                    isFinal && stopped && rejectedReason
                      ? 'line-through'
                      : 'none',
                  color:
                    isFinal && stopped && rejectedReason
                      ? 'error.main'
                      : 'text.primary',
                }}
              >
                {line}
              </Typography>
            );
          })}
        </Box>
      </Box>
      {stopped && rejectedReason && (
        <Typography
          variant='caption'
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'error.main',
            mt: 0.25,
          }}
        >
          Rolar novamente: {rejectedReason}
        </Typography>
      )}
    </Box>
  );
};

export default SlotReel;
