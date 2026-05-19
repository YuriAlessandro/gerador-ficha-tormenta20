export interface FeatureFlag {
  enabled: boolean;
  supporterOnly: boolean;
}

export interface FeatureFlags {
  multiclass: FeatureFlag;
  conditions: FeatureFlag;
  activeEffects: FeatureFlag;
  bestiary: FeatureFlag;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  multiclass: { enabled: true, supporterOnly: true },
  conditions: { enabled: false, supporterOnly: true },
  activeEffects: { enabled: true, supporterOnly: true },
  // Ferramenta de comunidade: kill-switch global apenas (sem trava por
  // apoiador — supporterOnly é ignorado para o bestiário).
  bestiary: { enabled: true, supporterOnly: false },
};
