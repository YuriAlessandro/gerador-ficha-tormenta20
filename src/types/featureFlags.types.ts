export interface FeatureFlag {
  enabled: boolean;
  supporterOnly: boolean;
}

export interface FeatureFlags {
  multiclass: FeatureFlag;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  multiclass: { enabled: true, supporterOnly: true },
};
