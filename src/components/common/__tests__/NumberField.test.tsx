import React, { useState } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import NumberField from '../NumberField';

/**
 * Smoke test de runtime do NumberField (Base UI + MUI v9) — garante que o
 * primitivo do Base UI funciona com React 17 (sem useId nativo) e que o
 * contrato value/onValueChange se comporta como esperado.
 */
const ControlledField: React.FC<{
  onValue: (v: number | null) => void;
}> = ({ onValue }) => {
  const [value, setValue] = useState<number | null>(5);
  return (
    <NumberField
      label='Quantidade'
      value={value}
      min={0}
      max={10}
      onValueChange={(v) => {
        setValue(v);
        onValue(v);
      }}
    />
  );
};

describe('NumberField', () => {
  it('renderiza com label e valor inicial', () => {
    render(<ControlledField onValue={() => undefined} />);
    const input = screen.getByLabelText('Quantidade') as HTMLInputElement;
    expect(input.value).toBe('5');
  });

  it('emite number ao digitar e null ao limpar', () => {
    const received: (number | null)[] = [];
    render(<ControlledField onValue={(v) => received.push(v)} />);
    const input = screen.getByLabelText('Quantidade') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '8' } });
    fireEvent.blur(input);
    expect(received).toContain(8);

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(received[received.length - 1]).toBeNull();
  });

  it('renderiza os botões de aumentar/diminuir e incrementa via teclado', () => {
    const received: (number | null)[] = [];
    render(<ControlledField onValue={(v) => received.push(v)} />);

    // Os botões de spinner existem (interação por pointer não funciona no
    // jsdom — sem setPointerCapture; o comportamento real é coberto no browser)
    expect(screen.getByLabelText('Aumentar')).toBeInTheDocument();
    expect(screen.getByLabelText('Diminuir')).toBeInTheDocument();

    const input = screen.getByLabelText('Quantidade') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(received[received.length - 1]).toBe(6);
  });
});
