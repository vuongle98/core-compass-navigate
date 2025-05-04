
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category?: string;
  audience?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureFlagResponse {
  success: boolean;
  data: FeatureFlag[];
  message?: string;
}
