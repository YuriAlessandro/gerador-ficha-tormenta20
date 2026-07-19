/* eslint-disable */
// Stub público — escrito à mão. Ver src/premium-stub/_inert.tsx.

// O catálogo real de condições é premium. Vazio aqui: recalculateSheet indexa
// com `CONDITION_TEMPLATES[ac.id]` seguido de `if (!tpl?.mechanical) return`,
// então nenhum bônus de condição é aplicado e a ficha sai com os valores base.
export const CONDITION_TEMPLATES: Record<string, any> = {};

export type ConditionId = string;
