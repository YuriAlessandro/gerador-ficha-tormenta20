import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SupplementId } from '@/types/supplement.types';
import AddItemDialog from '../AddItemDialog';
import ItemCatalogCard from '../ItemCatalogCard';
import { EQUIPMENT_CATALOG } from '../equipmentCatalog';
import { resolveItemPresentation, splitLoreAndEffect } from '../itemEffects';
import Equipment from '../../../../interfaces/Equipment';

vi.mock('@/hooks/useContentSupplements', () => ({
  useContentSupplements: () => [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ],
}));

describe('splitLoreAndEffect & resolveItemPresentation', () => {
  it('separa descrição narrativa (lore) do efeito mecânico', () => {
    const res = splitLoreAndEffect(
      'Malha formada por tibares entrelaçados. Você recebe +2 em Diplomacia.'
    );
    expect(res.lore).toBe('Malha formada por tibares entrelaçados.');
    expect(res.effectText).toBe('Você recebe +2 em Diplomacia.');
  });

  it('mantém apenas effectText quando o texto já começa com regra mecânica', () => {
    const res = splitLoreAndEffect(
      'Prender: agarrar o alvo + vencer novo teste de agarrar.'
    );
    expect(res.lore).toBeUndefined();
    expect(res.effectText).toBe(
      'Prender: agarrar o alvo + vencer novo teste de agarrar.'
    );
  });

  it('enriquece itens de alquimia e deuses de arton a partir do mapa Obsidian', () => {
    const acido: Equipment = {
      nome: 'Ácido',
      group: 'Alquimía',
      preco: 10,
      spaces: 0.5,
    };
    const pres = resolveItemPresentation(acido);
    expect(pres.lore).toContain('Frasco de vidro lacrado');
    expect(pres.effectText).toContain('2d4 pontos de dano de ácido');

    const amuleto: Equipment = {
      nome: 'Amuleto de Khalmyr',
      group: 'Item Geral',
      preco: 30,
      spaces: 1,
    };
    const amuletoPres = resolveItemPresentation(amuleto);
    expect(amuletoPres.lore).toContain('Talismã mundano');
    expect(amuletoPres.effectText).toContain('Sabedoria CD 10');
  });

  it('gera efeito textual a partir de rolls quando item não possui descricao', () => {
    const aguaConcentrada: Equipment = {
      nome: 'Água benta concentrada',
      group: 'Item Geral',
      preco: 60,
      spaces: 0.5,
      rolls: [
        {
          label: 'Dano de Luz',
          dice: '4d10',
          description:
            'O alvo sofre 4d10 pontos de dano de luz (Reflexos CD Sab reduz à metade).',
        },
      ],
    };
    const pres = resolveItemPresentation(aguaConcentrada);
    expect(pres.effectText).toContain('Dano de Luz (4d10)');
    expect(pres.effectText).toContain('4d10 pontos de dano de luz');
  });

  it('separa lore e bônus mecânico em alimentos especiais', () => {
    const gorad = resolveItemPresentation({
      nome: 'Gorad quente',
      group: 'Alimentação',
      preco: 18,
      spaces: 0.5,
    });
    expect(gorad.lore).toContain('leite caramelizado');
    expect(gorad.effectText).toContain('+2 PM temporários');

    const sopa = resolveItemPresentation({
      nome: 'Sopa de peixe',
      group: 'Alimentação',
      preco: 1,
      spaces: 0.5,
    });
    expect(sopa.effectText).toContain('recuperação de PM em +1 por nível');
  });
});

describe('ItemCatalogCard', () => {
  it('renderiza lore, bloco destacado de Efeito, badges e botão Adicionar', () => {
    const onAdd = vi.fn();
    const item: Equipment = {
      nome: 'Cota de moedas',
      group: 'Armadura',
      preco: 350,
      spaces: 2,
      descricao:
        'Malha formada por tibares entrelaçados. Você recebe +2 em Diplomacia.',
    };

    render(<ItemCatalogCard item={item} onAdd={onAdd} />);

    expect(screen.getByText('Cota de moedas')).toBeInTheDocument();
    expect(
      screen.getByText('Malha formada por tibares entrelaçados.')
    ).toBeInTheDocument();
    expect(screen.getByText('Efeito')).toBeInTheDocument();
    expect(
      screen.getByText('Você recebe +2 em Diplomacia.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Cota de moedas' }));
    expect(onAdd).toHaveBeenCalledWith(item, 1);
  });
});

describe('Cobertura de descrições por categoria', () => {
  it('todo item de Alquimía, Esotérico, Vestuário, Alimentação, Animal, Veículo, Armadura, Escudo e Item Geral possui lore ou efeito', () => {
    const targetGroups = new Set([
      'Alquimía',
      'Esotérico',
      'Vestuário',
      'Alimentação',
      'Animal',
      'Veículo',
      'Armadura',
      'Escudo',
      'Item Geral',
    ]);
    const missing: string[] = [];
    EQUIPMENT_CATALOG.filter((cat) => targetGroups.has(cat.group)).forEach(
      (cat) => {
        cat.subgroups.forEach((sg) => {
          sg.items.forEach((item) => {
            const pres = resolveItemPresentation(item);
            if (!pres.lore && !pres.effectText) {
              missing.push(`${cat.group}:${item.nome}`);
            }
          });
        });
      }
    );
    expect(missing).toEqual([]);
  });
});

describe('AddItemDialog — filtro combinado empunhadura + distância', () => {
  it('ao selecionar "1 Mão" e "Distância", exclui armas de duas mãos como Arco Curto e Besta Pesada', () => {
    render(
      <AddItemDialog open onClose={vi.fn()} onAddItem={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: '1 Mão' }));
    fireEvent.click(screen.getByRole('button', { name: 'Distância' }));

    expect(screen.queryByText('Arco Curto')).not.toBeInTheDocument();
    expect(screen.queryByText('Arco Longo')).not.toBeInTheDocument();
    expect(screen.queryByText('Besta Pesada')).not.toBeInTheDocument();
    expect(screen.queryByText('Mosquete')).not.toBeInTheDocument();

    expect(screen.getByText('Besta Leve')).toBeInTheDocument();
    expect(screen.getByText('Funda')).toBeInTheDocument();
    expect(screen.getByText('Azagaia')).toBeInTheDocument();
    expect(screen.getByText('Pistola')).toBeInTheDocument();
  });
});
