import { Atributo } from '@/data/systems/tormenta20/atributos';
import { CharacterAttributes } from '@/interfaces/Character';
import type CharacterSheet from '@/interfaces/CharacterSheet';

/**
 * Camada de "atributo efetivo".
 *
 * `atributos[attr].value` é o modificador BASE e permanente da ficha — o motor
 * nunca o muta, porque mutar já foi tentado e vazava efeito temporário para o
 * estado persistido (ver o docblock de `attributeExpansion.ts`). Todo delta
 * temporário (efeitos ativos, Forma Selvagem, efeitos customizados, o campo
 * manual `bonusAtributos`) é reduzido em `atributosTemporarios` no Step 7.46 do
 * `recalculateSheet`, e é AQUI que as duas metades se juntam.
 *
 * **Regra:** toda derivação de ficha lê o valor EFETIVO — perícias, ataque,
 * dano, Defesa, CD de magia, iniciativa, capacidade de carga, teste de atributo.
 *
 * As exceções são deliberadas e estão documentadas no ponto de uso:
 *  - **PV e PM máximos** leem o BASE. RAW de T20: bônus temporário de atributo
 *    não retroage em PV/PM (a própria Mente Divina diz "sem PV/PM adicionais").
 *  - **Pré-requisitos de poder e gates de bônus** leem o BASE: requisito é do
 *    personagem, não da cena — senão poderes apareceriam e sumiriam conforme o
 *    efeito expira.
 *  - **Exportações** (PDF, Foundry) leem o BASE: estado transitório de combate
 *    não é congelado na exportação.
 *  - **Condições** (`activeConditions`) não entram aqui. Em RAW "Fraco" é "−2 em
 *    testes de Força", penalidade de TESTE e não redução de atributo, com
 *    agregação pior-vence; elas continuam emitindo bônus `Skill` e só aparecem
 *    somadas no display do card (`getConditionAttributeModifier`).
 */

/** Delta temporário de um atributo (0 quando não há nenhum). */
export function getAttributeDelta(
  sheet: Pick<CharacterSheet, 'atributosTemporarios'>,
  attr: Atributo
): number {
  const value = sheet.atributosTemporarios?.[attr];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/** Modificador efetivo do atributo: base persistido + delta temporário. */
export function getEffectiveAttributeModifier(
  sheet: Pick<CharacterSheet, 'atributos' | 'atributosTemporarios'>,
  attr: Atributo
): number {
  const base = sheet.atributos?.[attr]?.value;
  const safeBase = typeof base === 'number' && Number.isFinite(base) ? base : 0;
  return safeBase + getAttributeDelta(sheet, attr);
}

/**
 * Os seis atributos já com o delta aplicado, no mesmo formato de
 * `sheet.atributos`.
 *
 * Existe porque a maioria dos consumidores (`weaponAttributeModifier`,
 * `getWeaponDisplayDamage`, `calcDefense`, `SkillTable`…) recebe um
 * `CharacterAttributes` inteiro como parâmetro: passar isto no lugar de
 * `sheet.atributos` migra o consumidor sem mexer na assinatura dele.
 *
 * ⚠️ Devolve objeto NOVO a cada chamada — memoizar (`useMemo`) nos componentes,
 * senão quebra as deps de memo que hoje dependem da identidade de `atributos`.
 */
export function getEffectiveAttributes(
  sheet: Pick<CharacterSheet, 'atributos' | 'atributosTemporarios'>
): CharacterAttributes {
  const base = sheet.atributos;
  if (!base) return base;
  if (!sheet.atributosTemporarios) return base;

  const result = {} as CharacterAttributes;
  (Object.keys(base) as Atributo[]).forEach((attr) => {
    const entry = base[attr];
    const delta = getAttributeDelta(sheet, attr);
    result[attr] =
      delta === 0 ? entry : { ...entry, value: entry.value + delta };
  });
  return result;
}
