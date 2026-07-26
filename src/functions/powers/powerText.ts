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

export interface PowerDisplaySource extends PowerTextSource {
  name: string;
  customName?: string;
  customDescription?: string;
}

/**
 * Texto CANÔNICO do poder, ignorando qualquer override do usuário.
 *
 * Continua existindo separado de `getPowerDisplayText` porque é o que a busca
 * usa como fallback (quem renomeou um poder ainda precisa achá-lo pelo nome do
 * livro), o que o editor usa para pré-preencher o campo, e o que o botão
 * "Restaurar padrão" devolve.
 */
export function getPowerText(power: PowerTextSource): string {
  return power.dynamicText ?? power.text ?? power.description ?? '';
}

/**
 * Nome a EXIBIR. `name` continua sendo a identidade do poder em todo o resto do
 * app (powersOrder, agrupamento, rolagens, requisitos, histórico) — mesmo
 * contrato de `Equipment.customDisplayName`.
 */
export function getPowerDisplayName(power: PowerDisplaySource): string {
  return power.customName?.trim() || power.name;
}

/**
 * Texto a EXIBIR. O override do usuário ganha até de `dynamicText`: se ele
 * reescreveu o poder, é isso que ele quer ver.
 */
export function getPowerDisplayText(power: PowerDisplaySource): string {
  return power.customDescription?.trim() || getPowerText(power);
}

export default getPowerText;
