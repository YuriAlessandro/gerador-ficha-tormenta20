import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import Equipment from '@/interfaces/Equipment';
import EquipmentTable from '../EquipmentTable';

/**
 * O jsdom não faz layout: `clientWidth` é sempre 0. Fingir a largura do
 * container é o que permite testar a decisão que causou o bug — a tabela
 * escolhia o modo pelo viewport, e no iPad em pé o viewport é de tablet mas o
 * container (coluna de 60%) tem largura de celular.
 */
const setContainerWidth = (width: number) => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => width,
  });
};

afterEach(() => {
  // @ts-expect-error — devolve o clientWidth original do jsdom.
  delete HTMLElement.prototype.clientWidth;
});

const adaga: Equipment = {
  nome: 'Adaga mitral',
  group: 'Arma',
  spaces: 1,
  dano: '1d4+1',
  critico: '18/x2',
  tipo: 'Perfuração',
};

describe('EquipmentTable — modo por largura do container', () => {
  it('mostra a tabela completa quando o container comporta as colunas', () => {
    setContainerWidth(800);
    render(<EquipmentTable items={[adaga]} characterName='Nimb' />);

    expect(screen.getByText('Crítico')).toBeInTheDocument();
    expect(screen.getByText('1d4+1')).toBeInTheDocument();
  });

  it('cai para cards com chips quando o container é estreito (iPad em pé)', () => {
    // A tabela de armas exige 572px; a coluna de 60% do iPad em pé dá ~360.
    setContainerWidth(360);
    render(<EquipmentTable items={[adaga]} characterName='Nimb' />);

    expect(screen.queryByText('Crítico')).not.toBeInTheDocument();
    expect(screen.getByText('Crít 18/x2')).toBeInTheDocument();
    expect(screen.getByText('Adaga mitral')).toBeInTheDocument();
  });

  it('usa o mesmo modo para todos os grupos, sem misturar tabela e cards', () => {
    // 400px comporta Armadura (364) mas não Arma (572): a aba inteira tem que
    // virar cards, senão a mesma tela mostraria dois estilos.
    setContainerWidth(400);
    const couro: Equipment = {
      nome: 'Armadura de couro',
      group: 'Armadura',
      spaces: 2,
    };
    render(<EquipmentTable items={[adaga, couro]} characterName='Nimb' />);

    expect(screen.queryByText('Crítico')).not.toBeInTheDocument();
    expect(screen.queryByText('Defesa')).not.toBeInTheDocument();
    expect(screen.getByText('Crít 18/x2')).toBeInTheDocument();
  });
});
