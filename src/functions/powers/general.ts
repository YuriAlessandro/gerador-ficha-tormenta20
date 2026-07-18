import { Atributo } from '@/data/systems/tormenta20/atributos';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { SpellPath } from '@/interfaces/Class';

export function getPlateauByLevel(nivel: number): number {
  if (nivel <= 4) {
    return 1;
  }
  if (nivel <= 10) {
    return 2;
  }
  if (nivel <= 16) {
    return 3;
  }

  return 4;
}

export function getCurrentPlateau(sheet: CharacterSheet): number {
  return getPlateauByLevel(sheet.nivel);
}

/**
 * Limite de PM concedido pela Tradição Perdida: 6 pontos de atributo, +2 por
 * patamar acima de iniciante (6 / 8 / 10 / 12).
 */
export function getTradicaoPerdidaPmCap(nivel: number): number {
  return 6 + 2 * (getPlateauByLevel(nivel) - 1);
}

/**
 * Valor de PM que a Tradição Perdida contribui, substituindo a contribuição do
 * atributo-chave da classe (habilidade "Magias"). Usa o valor permanente do
 * atributo escolhido (aumentos temporários não mutam `atributos[attr].value`,
 * então já são excluídos), limitado por `getTradicaoPerdidaPmCap`. Retorna
 * `null` quando o poder não está configurado (aí a contribuição normal vale).
 */
export function getTradicaoPerdidaPmValue(
  sheet: CharacterSheet
): number | null {
  const attr = sheet.tradicaoPerdidaPmAttribute;
  if (!attr) return null;
  const attrValue = sheet.atributos[attr]?.value ?? 0;
  return Math.min(attrValue, getTradicaoPerdidaPmCap(sheet.nivel));
}

/**
 * PM extras concedidos por um deus menor (Guia de Deuses Menores).
 *
 * Regra do livro: "Cada deus menor oferece um único poder concedido. Para
 * devotos de classes divinas (que normalmente teriam acesso a dois poderes
 * concedidos), em vez de um segundo poder, o devoto recebe uma quantidade de PM
 * adicionais igual a 1 + o status divino do deus, limitada por seu nível."
 *
 * Só os deuses menores têm `statusDivino`, então ele é o próprio marcador da
 * regra. Retorna 0 quando não se aplica.
 */
export function getDeusMenorPmBonus(sheet: CharacterSheet): number {
  const statusDivino = sheet.devoto?.divindade?.statusDivino;
  if (statusDivino === undefined) return 0;
  // A compensação existe porque a classe perde o segundo poder concedido;
  // classes que já recebiam um só (ou todos) não perdem nada e não compensam.
  if (sheet.classe?.qtdPoderesConcedidos !== 2) return 0;
  return Math.min(1 + statusDivino, sheet.nivel);
}

/**
 * Círculo máximo de magia que a divindade permite ao devoto.
 *
 * Regra do livro: "Devotos de deuses menores em classes conjuradoras divinas
 * (clérigos, druidas, frades...) podem aprender e lançar magias até o círculo
 * máximo que seu deus oferece, mesmo que o nível do devoto permita acesso a
 * círculos superiores." Esse círculo é o próprio status divino (escala 1-5,
 * igual à dos círculos).
 *
 * Vale só para conjuradores DIVINOS puros (`spellType: 'Divine'` — Clérigo,
 * Druida, Frade e a variante Usurpador). O Bardo é `'Both'` e majoritariamente
 * arcano, então fica de fora: a regra fala de classes conjuradoras divinas.
 *
 * Retorna `null` quando não há limite a aplicar.
 */
export function getDeityMaxSpellCircleFor(
  statusDivino: number | undefined,
  spellType: SpellPath['spellType'] | undefined
): number | null {
  if (statusDivino === undefined) return null;
  if (spellType !== 'Divine') return null;
  return statusDivino;
}

export function getDeityMaxSpellCircle(sheet: CharacterSheet): number | null {
  return getDeityMaxSpellCircleFor(
    sheet.devoto?.divindade?.statusDivino,
    sheet.classe?.spellPath?.spellType
  );
}

/**
 * Mensagem explicando por que uma magia está fora do alcance concedido pela
 * divindade, ou `null` se ela está liberada. Igual ao par
 * `isComplicationPowerUsable`/`getComplicationPowerWarning`: sempre computado
 * no render, NUNCA persistido na ficha — trocar de divindade ou de classe faz
 * o aviso sumir sozinho.
 */
export function getDeitySpellCircleWarning(
  sheet: CharacterSheet,
  spellCircle: number
): string | null {
  const maxCircle = getDeityMaxSpellCircle(sheet);
  if (maxCircle === null || spellCircle <= maxCircle) return null;
  const deityName = sheet.devoto?.divindade.name ?? 'sua divindade';
  return (
    `${deityName} é um deus menor de status divino ${maxCircle} e concede ` +
    `magias até o ${maxCircle}º círculo. Pela regra do Guia de Deuses ` +
    `Menores, você não pode lançar esta magia enquanto for devoto — a menos ` +
    `que ajude a elevar o status da sua divindade.`
  );
}

export function getAttributeIncreasesInSamePlateau(
  sheet: CharacterSheet
): Atributo[] {
  const plateau = getCurrentPlateau(sheet);

  const attibutesIncreasedInSamePlateau: Atributo[] = [];
  sheet.sheetActionHistory.forEach((sah) => {
    sah.changes.forEach((change) => {
      if (
        change.type === 'AttributeIncreasedByAumentoDeAtributo' &&
        change.plateau === plateau
      ) {
        attibutesIncreasedInSamePlateau.push(change.attribute);
      }
    });
  });

  return attibutesIncreasedInSamePlateau;
}
