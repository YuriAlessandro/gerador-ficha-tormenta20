import { ThreatActionType } from '../../../interfaces/ThreatSheet';

// Padrão é o default (gravado como undefined) e Passiva não tem ativação:
// nenhum dos dois aparece entre parênteses, como nos livros.
const UNLABELED_ACTION_TYPES: ThreatActionType[] = ['Padrão', 'Passiva'];

/**
 * Partes que vão entre parênteses depois do nome da habilidade, na ordem do
 * livro: "Constrição (Livre)", "Sopro (Completa, 3 PM)".
 */
export const getAbilityQualifiers = (ability: {
  actionType?: ThreatActionType;
  pmCost?: number;
}): string[] => {
  const parts: string[] = [];

  if (
    ability.actionType &&
    !UNLABELED_ACTION_TYPES.includes(ability.actionType)
  ) {
    parts.push(ability.actionType);
  }

  if (ability.pmCost && ability.pmCost > 0) {
    parts.push(`${ability.pmCost} PM`);
  }

  return parts;
};
