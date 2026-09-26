import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RevealStep } from '@/functions/treasure/revealSteps';

export type RevealStage = 'hidden' | 'spinning' | 'done';

/** Pausa entre um rolo e o próximo. */
export const REVEAL_GAP_MS = 150;

export interface RevealSequence {
  stageOf: (id: string) => RevealStage;
  /** O rolo `id` parou (e, se era descarte, já mostrou o motivo). */
  onStepDone: (id: string) => void;
  animating: boolean;
  skip: () => void;
  stepById: (id: string) => RevealStep | undefined;
}

/**
 * Encena os passos de um card, um por vez. Desligada, tudo aparece de uma vez
 * (o comportamento sem animação). Passos anexados depois (escolha do 2D)
 * continuam a sequência de onde ela parou.
 */
export function useRevealSequence(
  steps: RevealStep[],
  enabled: boolean,
  startDelay: number,
  skipToken: number
): RevealSequence {
  // Quantos passos já terminaram. Infinity = tudo revelado.
  const [done, setDone] = useState(enabled ? 0 : Infinity);
  const [spinning, setSpinning] = useState<number | null>(null);
  const initialSkipToken = useRef(skipToken);

  const skip = useCallback(() => {
    setSpinning(null);
    setDone(Infinity);
  }, []);

  // Desligar no meio revela tudo.
  useEffect(() => {
    if (!enabled) skip();
  }, [enabled, skip]);

  // "Pular animação" global.
  useEffect(() => {
    if (skipToken !== initialSkipToken.current) skip();
  }, [skipToken, skip]);

  useEffect(() => {
    if (done >= steps.length || spinning === done) return undefined;
    // Escolha do 2D: não gira, só aparece.
    if (steps[done].kind === 'choice') {
      setDone((d) => d + 1);
      return undefined;
    }
    const timer = setTimeout(
      () => setSpinning(done),
      done === 0 ? startDelay : REVEAL_GAP_MS
    );
    return () => clearTimeout(timer);
  }, [done, spinning, steps, startDelay]);

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    steps.forEach((s, i) => map.set(s.id, i));
    return map;
  }, [steps]);

  const stageOf = useCallback(
    (id: string): RevealStage => {
      const idx = indexById.get(id);
      // Conteúdo sem passo próprio acompanha o fim da sequência.
      if (idx === undefined) return done >= steps.length ? 'done' : 'hidden';
      if (idx < done) return 'done';
      return idx === spinning ? 'spinning' : 'hidden';
    },
    [indexById, done, spinning, steps.length]
  );

  const onStepDone = useCallback(
    (id: string) => {
      const idx = indexById.get(id);
      if (idx === undefined || idx !== done) return;
      setSpinning(null);
      setDone(idx + 1);
    },
    [indexById, done]
  );

  const stepById = useCallback(
    (id: string) => {
      const idx = indexById.get(id);
      return idx === undefined ? undefined : steps[idx];
    },
    [indexById, steps]
  );

  return {
    stageOf,
    onStepDone,
    animating: done < steps.length,
    skip,
    stepById,
  };
}
