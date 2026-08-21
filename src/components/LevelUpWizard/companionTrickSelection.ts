import { CompanionTrick } from '@/interfaces/Companion';
import { Spell } from '@/interfaces/Spells';
import { LevelUpSelections } from '@/interfaces/WizardSelections';

export type CompanionTrickReason = 'auto' | 'power';

export type CompanionTrickPatch = Partial<{
  companionIndex: number;
  trick: CompanionTrick | undefined;
  spell: Spell | undefined;
}>;

/**
 * Aplica uma alteração pontual na entry de truque do parceiro (`reason`) das
 * seleções do nível atual.
 *
 * Precisa ser puro e derivar TUDO de `prev` porque o passo de truque dispara
 * dois callbacks no mesmo evento (ex.: escolher a magia manda `spell` e depois
 * o `trick` com `choices.spell`). Com estado capturado no render, a segunda
 * chamada desfazia a primeira — a magia da "Magia Inata" nunca era gravada e
 * desmarcar o truque o ressuscitava (softlock).
 */
export function applyCompanionTrickPatch(
  prev: LevelUpSelections,
  reason: CompanionTrickReason,
  patch: CompanionTrickPatch,
  fallbackCompanionIndex: number
): LevelUpSelections {
  const selections = prev.companionTrickSelections || [];
  const existing = selections.find((entry) => entry.reason === reason);
  const others = selections.filter((entry) => entry.reason !== reason);

  // `trick: undefined` explícito = limpar a escolha deste passo
  if ('trick' in patch && patch.trick === undefined) {
    if (!existing) return prev;
    return {
      ...prev,
      companionTrickSelections: others.length ? others : undefined,
    };
  }

  const baseTrick = patch.trick ?? existing?.trick;
  // Sem truque não existe entry: um patch de magia/companheiro solto não pode
  // recriar o que acabou de ser limpo.
  if (!baseTrick) return prev;

  return {
    ...prev,
    companionTrickSelections: [
      ...others,
      {
        companionIndex:
          patch.companionIndex ??
          existing?.companionIndex ??
          fallbackCompanionIndex,
        trick: baseTrick,
        spell: 'spell' in patch ? patch.spell : existing?.spell,
        reason,
      },
    ],
  };
}
