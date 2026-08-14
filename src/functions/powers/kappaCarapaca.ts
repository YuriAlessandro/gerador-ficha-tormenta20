/**
 * Carapaça Kappa (habilidade de raça do Kappa, Ameaças de Arton).
 *
 * "Você soma sua Constituição na Defesa, limitado pelo seu nível, mas apenas se
 * não estiver usando armaduras pesadas (se já faz isso, como pela habilidade
 * Casca Grossa, em vez disso você recebe +2 na Defesa)."
 *
 * Não cabe num `sheetBonuses` estático no dado da raça por causa da cláusula
 * "se já faz isso": o valor depende de a ficha JÁ somar Constituição na Defesa
 * por outra fonte. O gate estático mais próximo seria
 * `{ kind: 'hasPower', value: 'Casca Grossa' }`, mas `sheetHasPowerNamed` deixa
 * `classe.abilities` de fora de propósito — e Casca Grossa é justamente uma
 * habilidade de classe do Lutador. Além disso, a regra é sobre o EFEITO ("somar
 * Constituição na Defesa"), não sobre um poder específico: casar pelo efeito
 * cobre qualquer outra fonte, oficial ou homebrew, sem lista de nomes.
 *
 * ⚠️ Como em `getHeavyArmorPowerBonuses`, os dois pontos de injeção rodam DEPOIS
 * do filtro `isBonusActive`, então anexar `condition` aqui não teria efeito — o
 * gate de armadura pesada é feito à mão. Rodar depois do filtro é o que torna a
 * detecção correta: o que sobrou em `sheetBonuses` é exatamente o conjunto de
 * bônus EM VIGOR, então um Lutador de armadura pesada (cuja parcela de
 * Constituição da Casca Grossa já foi removida) não conta como "já faz isso".
 */
import CharacterSheet, {
  SheetBonus,
  StatModifier,
} from '../../interfaces/CharacterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { isWearingHeavyArmor } from '../wornArmor';

export const CARAPACA_KAPPA_ABILITY_NAME = 'Carapaça Kappa';

const SOURCE: SheetBonus['source'] = {
  type: 'power',
  name: CARAPACA_KAPPA_ABILITY_NAME,
};

function hasCarapacaKappa(sheet: CharacterSheet): boolean {
  return (sheet.raca?.abilities ?? []).some(
    (ability) => ability.name === CARAPACA_KAPPA_ABILITY_NAME
  );
}

/** Modifier que soma Constituição — direta ou limitada por nível. */
function addsConstitution(modifier: StatModifier): boolean {
  return (
    (modifier.type === 'Attribute' || modifier.type === 'CappedAttribute') &&
    modifier.attribute === Atributo.CONSTITUICAO
  );
}

/**
 * A ficha já soma Constituição na Defesa por outra fonte? Ignora os bônus da
 * própria Carapaça Kappa para a injeção continuar idempotente caso o motor
 * chame isto com um array já injetado.
 */
function alreadySumsConstitutionToDefense(sheet: CharacterSheet): boolean {
  return (sheet.sheetBonuses ?? []).some(
    (bonus) =>
      bonus.target.type === 'Defense' &&
      addsConstitution(bonus.modifier) &&
      !(
        bonus.source.type === 'power' &&
        bonus.source.name === CARAPACA_KAPPA_ABILITY_NAME
      )
  );
}

/**
 * Parcela de Defesa da Carapaça Kappa. `[]` quando a ficha não é Kappa.
 *
 * As outras cláusulas da habilidade ("não pode ser flanqueado", "cobertura leve
 * se submerso ou caído") são situacionais de mesa e continuam só na descrição.
 */
export function getCarapacaKappaBonuses(sheet: CharacterSheet): SheetBonus[] {
  if (!hasCarapacaKappa(sheet)) return [];

  if (alreadySumsConstitutionToDefense(sheet)) {
    return [
      {
        source: SOURCE,
        target: { type: 'Defense' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ];
  }

  // Armadura pesada cancela só a parcela de Constituição. Sem outra fonte que
  // "já faça isso", não há o +2 substituto: a habilidade não dá nada.
  if (isWearingHeavyArmor(sheet)) return [];

  return [
    {
      source: SOURCE,
      target: { type: 'Defense' },
      modifier: {
        type: 'CappedAttribute',
        attribute: Atributo.CONSTITUICAO,
        capBy: 'level',
      },
    },
  ];
}

export default getCarapacaKappaBonuses;
