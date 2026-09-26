import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { TREASURE_DATASETS } from '@/data/treasure/treasureDatasets';
import type { TreasureItemInfo } from '@/functions/treasure/treasureItemInfo';
import {
  Die,
  TreasureRollResult,
  createTreasureContext,
  rollTreasure,
} from '@/functions/treasure/treasureRoller';
import TreasureResultCard from '../TreasureResultCard';

const sup = TREASURE_DATASETS.supplements;

const scripted =
  (values: number[]): Die =>
  () => {
    const v = values.shift();
    if (v === undefined) throw new Error('dado sem valor');
    return v;
  };

const lightArmor = (): TreasureItemInfo => ({
  melee: false,
  firingNotSling: false,
  ammo: false,
  cutOrPierce: false,
  armor: true,
  heavyArmor: false,
  shield: false,
});

/** ND 5: dinheiro nada; Superior (1 melhoria): armadura, Selada (descartada) → Ajustada. */
function superiorResult(): TreasureRollResult {
  const ctx = createTreasureContext(
    sup,
    scripted([1, 80, 4, 1, 90, 5]),
    lightArmor
  );
  return rollTreasure(ctx, '5', 'Padrão');
}

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('TreasureResultCard — animação', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('desligada: mostra o resultado inteiro na hora', () => {
    render(
      <TreasureResultCard
        result={superiorResult()}
        dataset={sup}
        onChoose={() => undefined}
        animate={false}
      />
    );
    expect(screen.getByText('Ajustada')).toBeInTheDocument();
    expect(screen.getByText(/Rolado novamente: Selada/)).toBeInTheDocument();
  });

  it('ligada: revela passo a passo até o resultado final', () => {
    const onAnimatingChange = vi.fn();
    render(
      <TreasureResultCard
        result={superiorResult()}
        dataset={sup}
        onChoose={() => undefined}
        animate
        onAnimatingChange={onAnimatingChange}
      />
    );
    // Nada revelado ainda: o resultado final não está na tela.
    expect(screen.queryByText('Ajustada')).not.toBeInTheDocument();
    expect(onAnimatingChange).toHaveBeenLastCalledWith(true);

    // Cada passo encadeia pausa → giro → parada → destaque; cada `act` só
    // agenda o próximo timer ao fim, então avança em várias fatias.
    for (let i = 0; i < 40; i += 1) advance(500);

    expect(screen.getByText('Ajustada')).toBeInTheDocument();
    expect(screen.getByText(/Rolado novamente: Selada/)).toBeInTheDocument();
    expect(onAnimatingChange).toHaveBeenLastCalledWith(false);
  });

  it('clicar no card pula a animação', () => {
    const { container } = render(
      <TreasureResultCard
        result={superiorResult()}
        dataset={sup}
        onChoose={() => undefined}
        animate
      />
    );
    advance(100);
    fireEvent.click(container.firstChild as Element);
    expect(screen.getByText('Ajustada')).toBeInTheDocument();
  });

  it('"Pular animação" global (skipToken) revela tudo', () => {
    const result = superiorResult();
    const { rerender } = render(
      <TreasureResultCard
        result={result}
        dataset={sup}
        onChoose={() => undefined}
        animate
        skipToken={0}
      />
    );
    rerender(
      <TreasureResultCard
        result={result}
        dataset={sup}
        onChoose={() => undefined}
        animate
        skipToken={1}
      />
    );
    expect(screen.getByText('Ajustada')).toBeInTheDocument();
  });

  it('desmontar no meio da animação não deixa timer pendente', () => {
    const { unmount } = render(
      <TreasureResultCard
        result={superiorResult()}
        dataset={sup}
        onChoose={() => undefined}
        animate
      />
    );
    advance(300);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
