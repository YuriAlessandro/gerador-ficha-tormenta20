/**
 * Ponto ÚNICO de "de quem esta ficha é devota".
 *
 * Antes da Devoção Dupla a resposta era sempre um nome só, e cada consumidor
 * comparava `sheet.devoto.divindade.name` na mão. Com a regra opcional de
 * Sincretismos de Arton a ficha pode contar como devota de dois deuses ao
 * mesmo tempo, então a pergunta passa a ter um CONJUNTO como resposta — e o
 * requisito `DEVOTO` avalia contra esse conjunto.
 *
 * É isso que faz o poder concedido único de um sincretismo se expressar sem
 * nenhum tipo de requisito novo: ele é um AND de duas cláusulas `DEVOTO`
 * (`[[{DEVOTO, A}, {DEVOTO, B}]]`), que só um devoto duplo satisfaz.
 */
import CharacterSheet from '../../interfaces/CharacterSheet';
import {
  PODER_CAPTURADO_KEY,
  parsePoderCapturadoDeity,
} from './poderCapturadoKey';

/**
 * Todos os deuses de quem a ficha conta como devota AGORA.
 *
 * Poder Capturado tem precedência e é EXCLUSIVO: o Usurpador não tem devoção
 * real (a habilidade "Inimigo dos Deuses" proíbe qualquer uma), então enquanto
 * o efeito está ativo o único deus que conta é o capturado.
 */
export function getSheetDeityNames(sheet: CharacterSheet): string[] {
  const capturado = sheet?.activeEffects?.find(
    (effect) => effect.powerKey === PODER_CAPTURADO_KEY
  );
  if (capturado) return [parsePoderCapturadoDeity(capturado.optionId)];

  const devoto = sheet?.devoto;
  if (!devoto?.divindade?.name) return [];

  const names = [devoto.divindade.name];
  // A secundária igual à primária seria uma devoção dupla degenerada — o
  // normalizer já a descarta, mas o dedup aqui mantém a função total.
  if (
    devoto.divindadeSecundaria &&
    devoto.divindadeSecundaria !== devoto.divindade.name
  ) {
    names.push(devoto.divindadeSecundaria);
  }
  return names;
}

/** A ficha é devota (de pelo menos um deus)? */
export function isDevoto(sheet: CharacterSheet): boolean {
  return getSheetDeityNames(sheet).length > 0;
}

/**
 * Rótulo de exibição da devoção. Lê `devoto` DIRETO, e não
 * `getSheetDeityNames`: um Poder Capturado ativo é estado transitório de
 * combate e não pode reescrever o campo "Divindade" da ficha.
 */
export function getDevotionLabel(
  sheet: CharacterSheet,
  separator = ' e '
): string | undefined {
  const devoto = sheet?.devoto;
  if (!devoto?.divindade?.name) return undefined;
  if (
    !devoto.divindadeSecundaria ||
    devoto.divindadeSecundaria === devoto.divindade.name
  ) {
    return devoto.divindade.name;
  }
  return `${devoto.divindade.name}${separator}${devoto.divindadeSecundaria}`;
}

/** A ficha usa a regra opcional de Devoção Dupla? */
export function hasDualDevotion(sheet: CharacterSheet): boolean {
  return getSheetDeityNames(sheet).length > 1;
}
