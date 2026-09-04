import Equipment from '../../interfaces/Equipment';
import { getManualStatFields } from '../manualStats';

/**
 * Quais estatísticas a ficha marca como "modificado manualmente". A flag
 * `hasManualEdits` congela o grupo inteiro no motor; a lista é só para a
 * marcação visual — e precisa degradar bem no item salvo antes dela existir.
 */
describe('getManualStatFields', () => {
  const espada: Equipment = {
    nome: 'Espada Longa',
    group: 'Arma',
    dano: '1d8',
    critico: 'x2',
  };

  it('item sem edição manual não marca nada', () => {
    expect(getManualStatFields(espada).size).toBe(0);
    // A lista sozinha não vale: quem manda no congelamento é a flag.
    expect(
      getManualStatFields({ ...espada, manualStatFields: ['dano'] }).size
    ).toBe(0);
  });

  it('marca apenas os campos da lista', () => {
    const item: Equipment = {
      ...espada,
      hasManualEdits: true,
      manualStatFields: ['critico'],
    };

    expect([...getManualStatFields(item)]).toEqual(['critico']);
  });

  it('item legado (flag sem lista) marca o grupo da arma', () => {
    const item: Equipment = { ...espada, hasManualEdits: true };

    expect([...getManualStatFields(item)]).toEqual([
      'dano',
      'atkBonus',
      'critico',
    ]);
  });

  it('item legado de defesa marca o grupo de defesa', () => {
    const item: Equipment = {
      nome: 'Brunea',
      group: 'Armadura',
      hasManualEdits: true,
    };

    expect([...getManualStatFields(item)]).toEqual([
      'defenseBonus',
      'armorPenalty',
    ]);
  });
});
