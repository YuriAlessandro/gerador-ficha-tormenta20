import CharacterSheet from '@/interfaces/CharacterSheet';
import {
  PowerSelectionRequirements,
  SelectionOptions,
} from '@/interfaces/PowerSelections';
import { GeneralPower } from '@/interfaces/Poderes';
import { Spell } from '@/interfaces/Spells';
import { getFilteredAvailableOptions } from '@/functions/powers/manualPowerSelection';
import { SupplementId } from '@/types/supplement.types';

/**
 * As duas metades da adição de um poder que exige escolhas do jogador.
 *
 * No editor antigo este par de blocos aparecia **nove vezes**: o `switch` de
 * auto-seleção quatro vezes (poder geral, poder geral repetível, poder de
 * classe, poder de classe repetível) e o merge em `manualSelections` cinco
 * (as quatro anteriores mais a confirmação do diálogo de seleção). Eram ~500
 * das 3.259 linhas do arquivo, e qualquer correção precisava ser aplicada em
 * todas as cópias para não divergir.
 */

/**
 * Um poder precisa parar e perguntar quando alguma exigência tem mais opções
 * do que o jogador vai escolher. Com uma opção só — ou quando ele leva todas —
 * não há decisão a tomar e a escolha é resolvida sozinha.
 */
export function requiresUserInput(
  requirements: PowerSelectionRequirements,
  sheet: CharacterSheet,
  supplements: SupplementId[]
): boolean {
  return requirements.requirements.some((req) => {
    const availableOptions = getFilteredAvailableOptions(
      req,
      sheet,
      supplements
    );
    return availableOptions.length > 1 && req.pick < availableOptions.length;
  });
}

/**
 * Resolve as escolhas que não dependem do jogador. Só preenche a exigência
 * quando as opções disponíveis batem exatamente com o que se pode escolher
 * (ou quando sobrou uma só).
 */
export function resolveAutoSelections(
  requirements: PowerSelectionRequirements,
  sheet: CharacterSheet,
  supplements: SupplementId[]
): SelectionOptions {
  const autoSelections: SelectionOptions = {};

  requirements.requirements.forEach((req) => {
    const availableOptions = getFilteredAvailableOptions(
      req,
      sheet,
      supplements
    );

    if (availableOptions.length !== req.pick && availableOptions.length !== 1) {
      return;
    }

    switch (req.type) {
      case 'learnSkill':
        autoSelections.skills = availableOptions as string[];
        break;
      case 'addProficiency':
        autoSelections.proficiencies = availableOptions as string[];
        break;
      case 'getGeneralPower':
        autoSelections.powers = availableOptions as GeneralPower[];
        break;
      case 'learnSpell':
      case 'learnAnySpellFromHighestCircle':
        autoSelections.spells = availableOptions as Spell[];
        break;
      case 'increaseAttribute':
        autoSelections.attributes = availableOptions as string[];
        break;
      default:
        break;
    }
  });

  return autoSelections;
}

/**
 * Junta a escolha nova com o que o poder já tinha registrado.
 *
 * Poder repetível **acumula** perícias, proficiências, poderes, magias e armas
 * — cada repetição concede mais um. `attributes` é a exceção deliberada: sobrescreve,
 * porque cada aplicação de um poder de aumento de atributo só deve mexer no
 * atributo recém-escolhido, não em todos os já escolhidos.
 *
 * Poder não repetível ignora o histórico e fica com a escolha nova.
 */
export function mergeSelections(
  previous: SelectionOptions | undefined,
  incoming: SelectionOptions,
  isRepeatable: boolean
): SelectionOptions {
  if (!isRepeatable) return incoming;

  const combined: SelectionOptions = { ...(previous ?? {}) };

  if (incoming.spells) {
    combined.spells = [...(combined.spells || []), ...incoming.spells];
  }
  if (incoming.skills) {
    combined.skills = [...(combined.skills || []), ...incoming.skills];
  }
  if (incoming.proficiencies) {
    combined.proficiencies = [
      ...(combined.proficiencies || []),
      ...incoming.proficiencies,
    ];
  }
  if (incoming.powers) {
    combined.powers = [...(combined.powers || []), ...incoming.powers];
  }
  if (incoming.weapons) {
    combined.weapons = [...(combined.weapons || []), ...incoming.weapons];
  }
  if (incoming.attributes) {
    combined.attributes = incoming.attributes;
  }

  return combined;
}

/** Um poder é repetível por qualquer um dos dois campos — os dados usam ambos. */
export function isRepeatablePower(power: {
  canRepeat?: boolean;
  allowSeveralPicks?: boolean;
}): boolean {
  return power.canRepeat || power.allowSeveralPicks || false;
}
