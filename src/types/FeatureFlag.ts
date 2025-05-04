
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  environments?: string[];
  roles?: string[];
  percentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureFlagGroup {
  name: string;
  flags: FeatureFlag[];
}
