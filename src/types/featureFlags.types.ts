export interface FeatureFlag {
  enabled: boolean;
  supporterOnly: boolean;
}

export interface FeatureFlags {
  multiclass: FeatureFlag;
  conditions: FeatureFlag;
  activeEffects: FeatureFlag;
  bestiary: FeatureFlag;
  partners: FeatureFlag;
  complications: FeatureFlag;
  spellAreaGuide: FeatureFlag;
  wildShape: FeatureFlag;
  animalCompanions: FeatureFlag;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  multiclass: { enabled: true, supporterOnly: true },
  conditions: { enabled: false, supporterOnly: true },
  activeEffects: { enabled: true, supporterOnly: true },
  // Ferramenta de comunidade: kill-switch global apenas (sem trava por
  // apoiador — supporterOnly é ignorado para o bestiário).
  bestiary: { enabled: true, supporterOnly: false },
  // Parceiros: NPCs auxiliares anexados a jogadores na mesa virtual.
  // Default off — admin habilita quando estiver pronto pra rollout.
  partners: { enabled: false, supporterOnly: true },
  // Complicações (regra opcional de Heróis de Arton) na criação de ficha.
  complications: { enabled: true, supporterOnly: true },
  // Guia de acerto: prévia em grid de batalha da área de efeito das magias.
  spellAreaGuide: { enabled: true, supporterOnly: true },
  // Druida: Forma Selvagem aplicada na ficha + repaginação visual enquanto
  // transformado. Flag separada da de companheiros para poder desligar só a
  // parte visual, que é a mais arriscada.
  wildShape: { enabled: false, supporterOnly: true },
  // Druida: companheiros animais persistentes na ficha.
  animalCompanions: { enabled: false, supporterOnly: true },
};
