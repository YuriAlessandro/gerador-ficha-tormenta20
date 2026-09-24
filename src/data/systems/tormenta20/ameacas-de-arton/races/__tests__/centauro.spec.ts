import { describe, test, expect } from 'vitest';
import CENTAURO from '../centauro';
import { createMockCharacterSheet } from '../../../../../../__mocks__/characterSheet';
import { normalizeSheet } from '../../../../../../functions/sheetNormalizer';
import { isPowerAvailable } from '../../../../../../functions/powers';
import combatPowers from '../../../powers/combatPowers';
import HEROIS_COMBAT_POWERS from '../../../herois-de-arton/powers/combatPowers';
import PALADINO_POWERS from '../../../herois-de-arton/classPowers/paladino';
import CharacterSheet from '../../../../../../interfaces/CharacterSheet';
import Race, { RaceAbility } from '../../../../../../interfaces/Race';

/**
 * A raça foi adicionada com o texto das habilidades INVENTADO, não transcrito de
 * Ameaças de Arton p. 105: Cascos e Ginete Natural terminavam com a mesma frase
 * incoerente, os cascos causavam perfuração no lugar de impacto, e a automação de
 * pré-requisitos construída em cima desse texto liberava 12 poderes indevidos.
 */

const getAbility = (name: string): RaceAbility => {
  const ability = CENTAURO.abilities.find((a) => a.name === name);
  if (!ability) throw new Error(`Habilidade "${name}" não encontrada`);
  return ability;
};

const centauroSheet = (
  abilities: RaceAbility[] = CENTAURO.abilities
): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.raca = {
    ...CENTAURO,
    abilities: JSON.parse(JSON.stringify(abilities)) as RaceAbility[],
  } as Race;
  return sheet;
};

describe('Centauro — dado bate com Ameaças de Arton p. 105', () => {
  test('os cascos causam dano de impacto, não de perfuração', () => {
    const cascos = getAbility('Cascos').sheetActions?.[0].action;
    if (cascos?.type !== 'addEquipment') {
      throw new Error('Cascos deveria conceder a arma natural');
    }
    const arma = cascos.equipment.Arma?.[0];

    expect(arma?.nome).toBe('Cascos');
    expect(arma?.tipo).toBe('Impac.');
    expect(arma?.dano).toBe('1d8');
    expect(arma?.critico).toBe('x2');
  });

  test('o texto de Cascos descreve o efeito real (1 PM por ataque extra)', () => {
    const { description } = getAbility('Cascos');

    expect(description).toContain('impacto');
    expect(description).toContain('gastar 1 PM');
    expect(description).not.toContain('perfuração');
    // Restos do texto embaralhado
    expect(description).not.toContain('combates ruins');
    expect(description).not.toContain('cavaleiro');
  });

  test('o texto de Ginete Natural cita Carga de Cavalaria e a ressalva do livro', () => {
    const { description } = getAbility('Ginete Natural');

    expect(description).toContain('Carga de Cavalaria');
    expect(description).toContain('não pode se beneficiar de uma montaria');
    expect(description).not.toContain('Ataque em Sela');
    expect(description).not.toContain('combates ruins');
  });

  test('Avantajado, tamanho e deslocamento seguem corretos', () => {
    expect(getAbility('Avantajado').description).toBe(
      'Seu tamanho é Grande e seu deslocamento é 12m.'
    );
    expect(CENTAURO.size?.name).toBe('Grande');
    expect(CENTAURO.getDisplacement?.(CENTAURO)).toBe(12);
  });
});

describe('Centauro — bypass de pré-requisito', () => {
  const cargaDeCavalaria = combatPowers.CARGA_DE_CAVALARIA;
  // Exige Montaria Sagrada + nível 10 — nada que o Centauro cumpra.
  const investidaSagrada = PALADINO_POWERS.find(
    (p) => p.name === 'Investida Sagrada'
  );
  const catafractario = Object.values(HEROIS_COMBAT_POWERS).find(
    (p) => p.name === 'Catafractário'
  );

  test('só Ginete Natural concede bypass, e só de Carga de Cavalaria', () => {
    expect(getAbility('Cascos').bypassPrereqForPowersNamed).toBeUndefined();
    expect(getAbility('Ginete Natural').bypassPrereqForPowersNamed).toEqual([
      'Carga de Cavalaria',
    ]);
    expect(
      getAbility('Ginete Natural').grantsPowerRequirements
    ).toBeUndefined();
  });

  test('Carga de Cavalaria fica disponível sem o poder Ginete', () => {
    expect(isPowerAvailable(centauroSheet(), cargaDeCavalaria)).toBe(true);
  });

  test('as outras Investidas NÃO são liberadas de graça', () => {
    // O casamento é por substring: `['Carga', 'Investida']` liberava as 11
    // Investidas do catálogo além de Carga de Cavalaria.
    if (!investidaSagrada) throw new Error('Investida Sagrada não encontrada');
    expect(isPowerAvailable(centauroSheet(), investidaSagrada)).toBe(false);
  });

  test('Catafractário NÃO é liberado (exigia Encouraçado + Ginete)', () => {
    if (!catafractario) throw new Error('Catafractário não encontrado');
    expect(isPowerAvailable(centauroSheet(), catafractario)).toBe(false);
  });
});

describe('Centauro — cura de fichas já salvas', () => {
  /** Uma ficha criada antes da correção, com a cópia errada embutida. */
  const staleAbilities: RaceAbility[] = [
    {
      name: 'Cascos',
      description:
        'Você possui uma arma natural de cascos (dano 1d8, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode escolher um poder Carga ou Investida mesmo sem cumprir seus pré-requisitos. Entretanto, se pode escolher Carga ou Investida e já tiver, estiver carregando um cavaleiro, sofre –2 em testes (além das penalidades de sobrecarga) se houver penalidades significativas; e se locomover em combates ruins para lançar magias.',
      bypassPrereqForPowersNamed: ['Carga', 'Investida'],
    },
    {
      name: 'Ginete Natural',
      description:
        'Você é considerado uma montaria para efeitos de fazer testes e para benefícios das armas que empunha, e pode escolher o poder Ataque em Sela sem cumprir seus pré-requisitos.',
      grantsPowerRequirements: ['Ginete'],
    },
  ];

  const staleSheet = (): CharacterSheet => {
    const sheet = centauroSheet(staleAbilities);
    sheet.bag.equipments.Arma = [
      {
        group: 'Arma',
        nome: 'Cascos',
        dano: '1d8',
        critico: 'x2',
        tipo: 'Perf.',
        preco: 0,
      },
    ];
    return sheet;
  };

  test('normalizeSheet corrige o texto das duas habilidades', () => {
    const sheet = staleSheet();
    normalizeSheet(sheet);

    const cascos = sheet.raca.abilities.find((a) => a.name === 'Cascos');
    const ginete = sheet.raca.abilities.find(
      (a) => a.name === 'Ginete Natural'
    );

    expect(cascos?.description).toBe(getAbility('Cascos').description);
    expect(ginete?.description).toBe(getAbility('Ginete Natural').description);
  });

  test('normalizeSheet corrige os hooks de pré-requisito', () => {
    const sheet = staleSheet();
    normalizeSheet(sheet);

    const cascos = sheet.raca.abilities.find((a) => a.name === 'Cascos');
    const ginete = sheet.raca.abilities.find(
      (a) => a.name === 'Ginete Natural'
    );

    expect(cascos?.bypassPrereqForPowersNamed).toBeUndefined();
    expect(ginete?.bypassPrereqForPowersNamed).toEqual(['Carga de Cavalaria']);
    expect(ginete?.grantsPowerRequirements).toBeUndefined();
  });

  test('a ficha antiga deixa de liberar as Investidas depois de normalizada', () => {
    const investidaSagrada = PALADINO_POWERS.find(
      (p) => p.name === 'Investida Sagrada'
    );
    if (!investidaSagrada) throw new Error('Investida Sagrada não encontrada');

    const sheet = staleSheet();
    expect(isPowerAvailable(sheet, investidaSagrada)).toBe(true);

    normalizeSheet(sheet);
    expect(isPowerAvailable(sheet, investidaSagrada)).toBe(false);
    expect(isPowerAvailable(sheet, combatPowers.CARGA_DE_CAVALARIA)).toBe(true);
  });

  test('normalizeSheet corrige a arma que já está na mochila', () => {
    // O recálculo nunca reinjeta a arma (`isActionAlreadyApplied` pula o
    // `addEquipment` assim que existe a entrada no histórico), então sem esta
    // cura o `tipo` errado ficaria congelado para sempre.
    const sheet = staleSheet();
    normalizeSheet(sheet);

    expect(sheet.bag.equipments.Arma[0].tipo).toBe('Impac.');
  });

  test('a cura é idempotente e não encosta em arma de outra raça', () => {
    const sheet = staleSheet();
    normalizeSheet(sheet);
    normalizeSheet(sheet);
    expect(sheet.bag.equipments.Arma[0].tipo).toBe('Impac.');

    const outraRaca = createMockCharacterSheet();
    outraRaca.bag.equipments.Arma = [
      { group: 'Arma', nome: 'Cascos', tipo: 'Perf.' },
    ];
    normalizeSheet(outraRaca);
    expect(outraRaca.bag.equipments.Arma[0].tipo).toBe('Perf.');
  });
});
