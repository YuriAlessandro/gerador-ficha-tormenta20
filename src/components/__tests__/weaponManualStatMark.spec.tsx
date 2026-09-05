import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import _ from 'lodash';
import Weapon from '../Weapon';
import { Armas } from '../../data/systems/tormenta20/equipamentos';
import Equipment from '../../interfaces/Equipment';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';

// O componente só precisa do contexto de rolagem para não explodir no mount:
// nenhum teste aqui afirma sobre a rolagem em si.
vi.mock('../../premium/hooks/useDiceRoll', () => ({
  useDiceRoll: () => ({
    showDiceResult: vi.fn(),
    showAttackRoll: vi.fn(),
    logExternalRoll: vi.fn(),
  }),
  default: () => ({
    showDiceResult: vi.fn(),
    showAttackRoll: vi.fn(),
    logExternalRoll: vi.fn(),
  }),
}));

/**
 * A linha inteira da arma é o alvo de clique que rola o ataque. A marcação de
 * "modificado manualmente" (sublinhado pontilhado + tooltip) não pode consumir
 * esse gesto: item salvo antes da marcação cai no fallback "grupo inteiro", o
 * que marcaria ataque, dano e crítico de toda arma já editada à mão — o miolo
 * da linha (quase a linha toda no celular) viraria zona morta.
 */
describe('Weapon — marcação de estatística editada à mão', () => {
  const atributos = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 2, mod: 2 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 3, mod: 3 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1, mod: 1 },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0, mod: 0 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0, mod: 0 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0, mod: 0 },
  } as unknown as CharacterAttributes;

  const renderRow = (equipment: Equipment, onRowClick: () => void) =>
    render(
      <div onClick={onRowClick} role='presentation'>
        <Weapon
          equipment={equipment}
          completeSkills={[]}
          atributos={atributos}
          nivel={1}
        />
      </div>
    );

  const espada = (extra: Partial<Equipment> = {}): Equipment => ({
    ..._.cloneDeep(Armas.ESPADA_LONGA),
    id: 'espada',
    ...extra,
  });

  let onRowClick: () => void;
  beforeEach(() => {
    onRowClick = vi.fn();
  });

  it('arma sem edição manual: clicar no dano propaga para a linha', () => {
    renderRow(espada(), onRowClick);

    fireEvent.click(screen.getByText(/1d8/));

    expect(onRowClick).toHaveBeenCalled();
  });

  it('arma com edição manual: clicar na estatística marcada ainda propaga', () => {
    renderRow(
      espada({ hasManualEdits: true, manualStatFields: ['dano'] }),
      onRowClick
    );

    fireEvent.click(screen.getByText(/1d8/));

    expect(onRowClick).toHaveBeenCalled();
  });

  it('item salvo antes da marcação (grupo inteiro) não vira zona morta', () => {
    // Sem `manualStatFields`, `getManualStatFields` devolve o grupo todo —
    // ataque, dano e crítico ficam marcados na mesma linha.
    renderRow(espada({ hasManualEdits: true }), onRowClick);

    fireEvent.click(screen.getByText(/1d8/));

    expect(onRowClick).toHaveBeenCalled();
  });

  /**
   * O sublinhado pontilhado é visível no mobile, mas a explicação dele não: sem
   * hover, o tooltip do MUI só abre com long-press — e como ele não cancela o
   * clique sintético que vem depois, o gesto rolaria o ataque junto. A
   * explicação sai por um ícone próprio, que pode parar a propagação.
   */
  describe('afordância de toque', () => {
    it('mostra o ícone com os campos marcados quando há edição manual', () => {
      renderRow(
        espada({ hasManualEdits: true, manualStatFields: ['dano'] }),
        onRowClick
      );

      expect(
        screen.getByLabelText('Estatísticas modificadas manualmente')
      ).toBeInTheDocument();
    });

    it('não mostra o ícone em arma sem edição manual', () => {
      renderRow(espada(), onRowClick);

      expect(
        screen.queryByLabelText('Estatísticas modificadas manualmente')
      ).not.toBeInTheDocument();
    });

    it('clicar no ícone não rola o ataque', () => {
      renderRow(
        espada({ hasManualEdits: true, manualStatFields: ['dano'] }),
        onRowClick
      );

      fireEvent.click(
        screen.getByLabelText('Estatísticas modificadas manualmente')
      );

      expect(onRowClick).not.toHaveBeenCalled();
    });
  });

  /**
   * A linha é um flex container, e nele cada trecho de texto contíguo vira um
   * item anônimo. Com as marcas de edição manual quebrando o texto em vários
   * elementos, os `•` e os parênteses do crítico viravam itens próprios e
   * quebravam linha soltos dos números (visível no mobile). Cada valor e seus
   * acompanhantes precisam viver num mesmo nó `nowrap`.
   */
  describe('agrupamento das estatísticas', () => {
    it('o crítico viaja junto do separador e dos parênteses', () => {
      const { container } = renderRow(
        espada({ hasManualEdits: true, manualStatFields: ['critico'] }),
        onRowClick
      );

      // Um único nó carrega separador + parênteses + valor, então nenhuma
      // quebra de linha consegue separá-los.
      const grupos = Array.from(container.querySelectorAll('span')).filter(
        (el) => (el.textContent ?? '').trim() === '• (19)'
      );

      expect(grupos.length).toBeGreaterThan(0);
    });

    it('nenhum separador vira item flex solto na linha', () => {
      const { container } = renderRow(
        espada({ hasManualEdits: true }),
        onRowClick
      );

      // A linha é `display: flex`, e nela cada trecho de TEXTO CRU contíguo
      // vira um item anônimo que encolhe e quebra por conta própria. Era assim
      // que `•`, `(` e `)` se soltavam dos números. Nenhum filho direto da
      // linha pode ser um texto solto de separadores.
      const linha = container.querySelector('p');
      const textosSoltos = Array.from(linha?.childNodes ?? [])
        .filter((no) => no.nodeType === Node.TEXT_NODE)
        .map((no) => (no.textContent ?? '').trim())
        .filter((texto) => texto.length > 0);

      expect(textosSoltos.filter((t) => /[•()·]/.test(t))).toEqual([]);
    });
  });
});
