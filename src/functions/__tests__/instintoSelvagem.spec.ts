import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet, {
  ClassLevelEntry,
} from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import Bag from '../../interfaces/Bag';
import Skill from '../../interfaces/Skills';
import BARBARO from '../../data/systems/tormenta20/classes/barbaro';
import GUERREIRO from '../../data/systems/tormenta20/classes/guerreiro';

/**
 * Instinto Selvagem (Bárbaro, JDA p. 42): "No 3º nível, você recebe +1 em
 * rolagens de dano, Percepção e Reflexos. A cada seis níveis, esse bônus
 * aumenta em +1." → +1 no 3º, +2 no 9º, +3 no 15º (Tabela 1-6).
 *
 * Diferente de Fúria (que diz "rolagens de dano CORPO A CORPO"), o texto não
 * qualifica o tipo de arma — vale para toda rolagem de dano.
 *
 * Regressão relatada por usuário: Percepção e Reflexos vinham certos, mas o
 * dano não. Estes testes travam os três bônus juntos.
 */

const espadaLonga: Equipment = {
  id: 'w-espada-longa',
  nome: 'Espada Longa',
  group: 'Arma',
  dano: '1d8',
  critico: 'x2',
  alcance: '-',
};

const arcoLongo: Equipment = {
  id: 'w-arco-longo',
  nome: 'Arco Longo',
  group: 'Arma',
  dano: '1d8',
  critico: 'x3',
  alcance: 'Longo',
};

const danoOf = (sheet: CharacterSheet, id: string): string | undefined =>
  sheet.bag.equipments.Arma.find((w) => w.id === id)?.dano;

const othersOf = (sheet: CharacterSheet, skill: Skill): number =>
  sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

/** Ficha de Bárbaro mono-classe no nível pedido. */
const mkBarbaro = (
  nivel: number,
  weapons: Equipment[] = [espadaLonga]
): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.nivel = nivel;
  sheet.classe = _.cloneDeep(BARBARO);
  sheet.bag = new Bag({ Arma: weapons.map((w) => _.cloneDeep(w)) });
  return sheet;
};

/** Entradas de `classLevels` para uma multiclasse A×n + B×m. */
const mkClassLevels = (
  primary: string,
  primaryLevels: number,
  secondary: string,
  secondaryLevels: number
): ClassLevelEntry[] => {
  const entries: ClassLevelEntry[] = [];
  for (let i = 1; i <= primaryLevels; i += 1) {
    entries.push({ level: entries.length + 1, className: primary });
  }
  for (let i = 1; i <= secondaryLevels; i += 1) {
    entries.push({ level: entries.length + 1, className: secondary });
  }
  return entries;
};

describe('Instinto Selvagem — progressão do bônus de dano', () => {
  // JDA p.42 / Tabela 1-6: +1 no 3º, +2 no 9º, +3 no 15º.
  it.each([
    [2, '1d8'], // habilidade só existe a partir do 3º
    [3, '1d8+1'],
    [8, '1d8+1'],
    [9, '1d8+2'],
    [14, '1d8+2'],
    [15, '1d8+3'],
    [20, '1d8+3'],
  ])('nível %i → dano %s', (nivel, esperado) => {
    const r = recalculateSheet(mkBarbaro(nivel as number));
    expect(danoOf(r, 'w-espada-longa')).toBe(esperado);
  });

  it('os três bônus (dano, Percepção, Reflexos) andam juntos no nível 9', () => {
    const r = recalculateSheet(mkBarbaro(9));
    expect(danoOf(r, 'w-espada-longa')).toBe('1d8+2');
    expect(othersOf(r, Skill.PERCEPCAO)).toBe(2);
    expect(othersOf(r, Skill.REFLEXOS)).toBe(2);
  });

  it('não tem restrição de alcance: arco também recebe o bônus', () => {
    // Fúria diz "corpo a corpo"; Instinto Selvagem não qualifica.
    const r = recalculateSheet(mkBarbaro(3, [espadaLonga, arcoLongo]));
    expect(danoOf(r, 'w-espada-longa')).toBe('1d8+1');
    expect(danoOf(r, 'w-arco-longo')).toBe('1d8+1');
  });

  it('é idempotente: recalcular duas vezes não dobra o bônus', () => {
    const r = recalculateSheet(recalculateSheet(mkBarbaro(3)));
    expect(danoOf(r, 'w-espada-longa')).toBe('1d8+1');
  });

  it('soma por cima do aprimoramento e continua estável entre recálculos', () => {
    // Guarda do curto-circuito de `resetWeaponToBase`: armas com encantamento
    // não são resetadas, e sim recomputadas pelo Step 17 antes do baking.
    const encantada: Equipment = {
      ..._.cloneDeep(espadaLonga),
      id: 'w-encantada',
      atkBonus: 0,
      enchantments: [{ enchantment: 'Formidável' }], // +2 atk / +2 dano
    };
    const uma = recalculateSheet(mkBarbaro(3, [encantada]));
    expect(danoOf(uma, 'w-encantada')).toBe('1d8+3'); // 2 (encantamento) + 1

    const duas = recalculateSheet(uma);
    expect(danoOf(duas, 'w-encantada')).toBe('1d8+3');
  });

  it('não mexe em arma com edição manual', () => {
    const manual: Equipment = {
      ..._.cloneDeep(espadaLonga),
      id: 'w-manual',
      dano: '1d8+7',
      hasManualEdits: true,
    };
    const r = recalculateSheet(mkBarbaro(3, [manual]));
    expect(danoOf(r, 'w-manual')).toBe('1d8+7');
  });
});

describe('Instinto Selvagem — multiclasse usa o nível de BÁRBARO', () => {
  const mkMulticlasse = (
    barbaroLevels: number,
    guerreiroLevels: number
  ): CharacterSheet => {
    const sheet = mkBarbaro(barbaroLevels + guerreiroLevels);
    sheet.classLevels = mkClassLevels(
      BARBARO.name,
      barbaroLevels,
      GUERREIRO.name,
      guerreiroLevels
    );
    return sheet;
  };

  it('Bárbaro 3 + Guerreiro 3 (nível 6) → +1, não +2', () => {
    const r = recalculateSheet(mkMulticlasse(3, 3));
    expect(danoOf(r, 'w-espada-longa')).toBe('1d8+1');
    expect(othersOf(r, Skill.PERCEPCAO)).toBe(1);
    expect(othersOf(r, Skill.REFLEXOS)).toBe(1);
  });

  it('Bárbaro 9 + Guerreiro 6 (nível 15) → +2, não +3', () => {
    const r = recalculateSheet(mkMulticlasse(9, 6));
    expect(danoOf(r, 'w-espada-longa')).toBe('1d8+2');
  });
});
