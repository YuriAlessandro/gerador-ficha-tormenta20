/**
 * As oito fontes de poder da ficha não concordam sobre onde guardam o texto:
 * `ClassPower`/`ClassAbility` usam `text`, `RaceAbility`/`OriginPower`/
 * `GeneralPower`/`CustomPower` usam `description`, e alguns poucos poderes
 * (ex: Autoridade Eclesiástica) sobrescrevem tudo com `dynamicText`.
 *
 * Antes disso a exibição chamava um gerador para cada formato e renderizava os
 * dois, o que produzia um `<div>{undefined}</div>` em toda linha expandida.
 */
export interface PowerTextSource {
  text?: string;
  dynamicText?: string;
  description?: string;
}

export function getPowerText(power: PowerTextSource): string {
  return power.dynamicText ?? power.text ?? power.description ?? '';
}

export default getPowerText;
