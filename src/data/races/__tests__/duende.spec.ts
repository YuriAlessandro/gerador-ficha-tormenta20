import DUENDE from '../duende';

describe('Testa as definições da raça Duende (nova implementação)', () => {
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
    const nomesHabilidades = DUENDE.abilities.map((a) => a.name);
    expect(nomesHabilidades).toContain('Aversão a Ferro');
    expect(nomesHabilidades).toContain('Aversão a Sinos');
  });

  test('Deve incluir a habilidade de "Poderes de Duende" com a specialAction correta', () => {
    const poderesHabilidade = DUENDE.abilities.find(
      (ability) => ability.name === 'Poderes de Duende'
    );
    expect(poderesHabilidade).toBeDefined();
    expect(poderesHabilidade?.sheetActions).toBeDefined();
    expect(poderesHabilidade?.sheetActions?.[0].action.type).toBe('special');
    if (poderesHabilidade?.sheetActions?.[0].action.type === 'special') {
      expect(poderesHabilidade?.sheetActions?.[0].action.specialAction).toBe(
        'duendePowers'
      );
    }
  });
});
