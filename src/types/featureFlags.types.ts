export interface FeatureFlag {
  enabled: boolean;
  supporterOnly: boolean;
  /**
   * Parâmetro numérico opcional da flag. Hoje só a `limitBoost` usa (guarda o
   * multiplicador dos limites); as demais ignoram.
   */
  value?: number;
}

export interface FeatureFlags {
  multiclass: FeatureFlag;
  conditions: FeatureFlag;
  activeEffects: FeatureFlag;
  bestiary: FeatureFlag;
  partners: FeatureFlag;
  complications: FeatureFlag;
  spellAreaGuide: FeatureFlag;
  playerScreen: FeatureFlag;
  limitBoost: FeatureFlag;
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
  // Tela do Jogador: segunda tela pública que o mestre projeta para a mesa.
  playerScreen: { enabled: true, supporterOnly: true },
  // Boost de limites da meta de 200 apoiadores: multiplica TODOS os limites por
  // nível de apoio (menos suplementos), inclusive os de contas gratuitas.
  // `supporterOnly` é ignorado — vale para todo mundo. Default desligado: o
  // admin liga quando quiser anunciar.
  limitBoost: { enabled: false, supporterOnly: false, value: 1.5 },
};
