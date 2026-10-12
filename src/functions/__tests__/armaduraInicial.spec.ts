import { describe, expect, it } from 'vitest';
import generateRandomSheet, { getStartingArmorOptions } from '../general';
import { findClassDescription } from '../multiclass';
import SelectOptions from '../../interfaces/SelectedOptions';
import { SupplementId } from '../../types/supplement.types';

/**
 * JdA p. 140 (Equipamento Inicial): "Uma armadura de couro, couro batido ou
 * gibão de peles, a sua escolha. Se você tiver proficiência com armaduras
 * pesadas, em vez disso pode começar com uma brunea." As opções saíam de
 * `armadurasLeves` — todas as leves do jogo —, o que dava armadura acolchoada
 * e couraça (T$ 500) de graça.
 */

const SUPPS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const classe = (nome: string) => findClassDescription(nome, undefined, SUPPS)!;
const nomes = (items: { nome: string }[]) => items.map((item) => item.nome);

const LEVES_INICIAIS = ['Armadura de couro', 'Couro batido', 'Gibão de peles'];

describe('opções de armadura inicial', () => {
  it('sem proficiência com pesadas: couro, couro batido ou gibão', () => {
    expect(nomes(getStartingArmorOptions(classe('Ladino')))).toEqual(
      LEVES_INICIAIS
    );
  });

  it('com proficiência com pesadas: brunea, além das três', () => {
    expect(nomes(getStartingArmorOptions(classe('Paladino')))).toEqual([
      'Brunea',
      ...LEVES_INICIAIS,
    ]);
  });

  it('Arcanista e variantes começam sem armadura', () => {
    expect(getStartingArmorOptions(classe('Arcanista'))).toHaveLength(0);
    expect(getStartingArmorOptions(classe('Necromante'))).toHaveLength(0);
  });

  it('acolchoada e couraça nunca aparecem', () => {
    ['Ladino', 'Paladino', 'Guerreiro', 'Bardo'].forEach((nome) => {
      const opcoes = nomes(getStartingArmorOptions(classe(nome)));
      expect(opcoes).not.toContain('Armadura Acolchoada');
      expect(opcoes).not.toContain('Couraça');
    });
  });

  it('a ficha aleatória só sorteia entre as três leves', () => {
    for (let i = 0; i < 50; i += 1) {
      const sheet = generateRandomSheet({
        nivel: 1,
        classe: 'Bardo',
        raca: '',
        origin: '',
        devocao: { label: 'Não devoto', value: '--' },
        supplements: SUPPS,
      } as unknown as SelectOptions);
      const armaduras = sheet.bag?.equipments?.Armadura ?? [];
      // A origem pode trazer armadura própria; a da classe é a primeira.
      expect(armaduras.length).toBeGreaterThan(0);
      expect(LEVES_INICIAIS).toContain(armaduras[0].nome);
    }
  });
});
