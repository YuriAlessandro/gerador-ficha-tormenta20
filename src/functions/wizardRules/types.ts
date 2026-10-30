/**
 * Acessos do usuário que mudam quais passos os assistentes de criação e de
 * subir de nível mostram. Nos componentes vêm de hooks
 * (`useOptionalRulesAvailable`, `useFeatureAccess`); fora deles (simulador de
 * builds) quem chama decide.
 */
export interface WizardAccess {
  /** Regras opcionais de Heróis de Arton (Atributos Variados, Idades, Raças Abertas). */
  optionalRules: boolean;
  /** Complicações (Heróis de Arton). */
  complications: boolean;
  /** Multiclasse no assistente de subir de nível. */
  multiclass: boolean;
}

/** Passo de um assistente que ainda não tem a escolha completa. */
export interface WizardStepGap {
  /** Nível da ficha: 1 = criação. */
  level: number;
  /** Rótulo do passo, igual ao que o assistente mostra. */
  step: string;
}
