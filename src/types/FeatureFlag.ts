
export interface FeatureFlag {
  id?: string;
  key: string;
  name?: string;
  description?: string;
  enabled: boolean;
  environments?: string[];
  roles?: string[];
  percentage?: number;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
  group?: string;
}

export interface FeatureFlagConfig {
  key: string;
  enabled: boolean;
  description?: string;
  group?: string;
  environments?: string[];
  roles?: string[];
  percentage?: number;
}

export interface FeatureFlagGroup {
  name: string;
  flags: FeatureFlag[];
}
