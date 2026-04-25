export interface FeatureFlag {
  enabled: boolean;
  supporterOnly: boolean;
}

export interface FeatureFlags {
  multiclass: FeatureFlag;
  conditions: FeatureFlag;
  parodySpellPicker: FeatureFlag;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  multiclass: { enabled: true, supporterOnly: true },
  conditions: { enabled: false, supporterOnly: true },
  parodySpellPicker: { enabled: true, supporterOnly: false },
};
