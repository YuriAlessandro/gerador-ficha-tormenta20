import CharacterSheet from '../../interfaces/CharacterSheet';
import { SupplementId } from '../../types/supplement.types';
import type {
  ActiveEffectUsageOption,
  ActivePowerDefinition,
} from '../../premium/interfaces/ActiveEffect';
import { resolveCapturedPower } from './poderCapturado';
import { getSheetDeityNames } from './deityNames';
import {
  PODER_CAPTURADO_KEY,
  buildPoderCapturadoOptionId,
  parsePoderCapturadoDeity,
} from './poderCapturadoKey';

/**
 * Poder Capturado como efeito ativo VIRTUAL.
 *
 * A definição não vive no registry premium porque as opções de uso saem da
 * lista de escolhas gravada em `sheet.poderesCapturados` — é por ficha. Mesmo
 * padrão de `getAnimalCompanionActivatedPowers`.
 *
 * Duas regras saem de graça da infraestrutura existente:
 *  - "até você usá-lo novamente": `handleActiveEffectActivate` substitui
 *    qualquer instância anterior do MESMO `powerKey`;
 *  - "até o fim do dia": o `clearActiveEffects` do diálogo de descanso.
 *
 * Só `import type` de premium: o repo público não pode importar VALORES de
 * `src/premium` (o stub resolve apenas os tipos).
 */

// Reexportados de `poderCapturadoKey` (módulo folha) para não quebrar quem já
// os importa daqui. A separação existe para evitar ciclo com `deityNames`.
export {
  PODER_CAPTURADO_KEY,
  buildPoderCapturadoOptionId,
  parsePoderCapturadoDeity,
};

/**
 * O deus de quem a ficha conta como devota AGORA: o capturado pelo efeito
 * ativo, se houver, senão a devoção real.
 *
 * "Se passar, você é considerado um devoto desse deus para efeitos de
 * habilidades e itens."
 */
export function getEffectiveDeityName(
  sheet: CharacterSheet
): string | undefined {
  // Delega ao ponto único e devolve o PRIMEIRO: quem chama aqui quer um nome
  // só (rótulos, texto dinâmico, condições de bônus). Com Devoção Dupla isso
  // é a divindade primária — quem precisa das duas usa `getSheetDeityNames`.
  return getSheetDeityNames(sheet)[0];
}

/**
 * Definição virtual com uma opção de uso por par deus+poder escolhido, ou
 * `null` quando a ficha não tem escolha nenhuma.
 *
 * `pmCost` é 0: os 3 PM da regra só são perdidos na FALHA do teste, e isso é
 * cobrado pelo diálogo de ativação, não pelo custo da opção.
 */
export function getPoderCapturadoDefinition(
  sheet: CharacterSheet,
  supplements: SupplementId[]
): ActivePowerDefinition | null {
  const choices = sheet?.poderesCapturados ?? [];
  if (choices.length === 0) return null;

  const options = choices.reduce<ActiveEffectUsageOption[]>((acc, choice) => {
    const resolved = resolveCapturedPower(choice, supplements);
    if (!resolved) return acc;

    // `ActiveEffectBonus` é `SheetBonus` sem o `source` — o `source` real é
    // reatribuído por `applyActiveEffectBonuses` no recálculo.
    const bonuses = (resolved.power.sheetBonuses ?? []).map(
      ({ source: _source, ...rest }) => rest
    );

    acc.push({
      id: buildPoderCapturadoOptionId(choice.divindade, choice.poder),
      label: `${choice.poder} (${choice.divindade})`,
      pmCost: 0,
      bonuses,
    });
    return acc;
  }, []);

  if (options.length === 0) return null;

  return {
    key: PODER_CAPTURADO_KEY,
    name: 'Poder Capturado',
    className: 'Usurpador',
    sourceLabel: 'Usurpador · Poder Capturado',
    affectsAllies: false,
    description:
      'Você é considerado devoto do deus escolhido para efeitos de habilidades e itens e pode usar o poder concedido roubado, sem seguir Obrigações e Restrições. Dura até o fim do dia ou até você usar o Poder Capturado novamente.',
    getUsageOptions: () => options,
  };
}
