import DUENDE from '../duende';
import { Atributo } from '../../atributos';

describe('Testa as definições da raça Duende', () => {
  test('Deve ter o nome "Duende"', () => {
    expect(DUENDE.name).toBe('Duende');
  });

  test('Deve ser do tipo Espírito', () => {
    const tipoHabilidade = DUENDE.abilities.find(
      (ability) => ability.name === 'Tipo de Criatura'
    );
    expect(tipoHabilidade).toBeDefined();
    expect(tipoHabilidade?.description).toContain('Espírito');
  });

  test('Deve ter dois bônus de atributo à escolha', () => {
    expect(DUENDE.attributes.attrs).toHaveLength(2);
    expect(DUENDE.attributes.attrs).toEqual([
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ]);
  });

  test('Deve incluir as duas limitações obrigatórias', () => {
    const nomesHabilidades = DUENDE.abilities.map(a => a.name);
    expect(nomesHabilidades).toContain('Aversão a Ferro');
    expect(nomesHabilidades).toContain('Aversão a Sinos');
  });

  describe('Testa a função setup', () => {
    test('Deve adicionar a habilidade de Tabu', () => {
      const race = DUENDE.setup(DUENDE, { choices: { tabu: 'Luta' } });
      const tabu = race.abilities.find(a => a.name === 'Tabu');
      expect(tabu).toBeDefined();
      expect(tabu.description).toContain('Luta');
      expect(tabu.sheetBonuses[0].modifier.value).toBe(-5);
    });

    test('Deve configurar o tamanho corretamente', () => {
      const race = DUENDE.setup(DUENDE, { choices: { tamanho: 'Grande' } });
      expect(race.getDisplacement()).toBe(9);
      expect(race.attributes.attrs).toContainEqual({ attr: Atributo.DESTREZA, mod: -1 });
    });

    test('Deve configurar a natureza corretamente', () => {
      const race = DUENDE.setup(DUENDE, { choices: { natureza: 'Mineral' } });
      const natureza = race.abilities.find(a => a.name === 'Natureza Mineral');
      expect(natureza).toBeDefined();
    });

    test('Deve adicionar os presentes escolhidos', () => {
      const race = DUENDE.setup(DUENDE, { choices: { presentes: ['Voo'] } });
      const presente = race.abilities.find(a => a.name === 'Voo');
      expect(presente).toBeDefined();
    });
  });
});
