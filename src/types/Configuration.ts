export interface FeatureFlag {
  id?: number;
  key: string;
  value?: string;
  type?: string;
  description?: string;
  enabled: boolean;
  environments?: string[];
  roles?: string[];
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

export interface EndpointSecure {
  id: number;
  endpointPattern: string;
  method: string;
  authority: string;
  isRole: boolean;
}

export interface Configuration {
  id: number;
  key: string;
  value: string;
  type: string;
  lastModified: string;
  environment: string;
  description?: string;
}

export interface ApiKey {
  id: number;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "inactive" | "expired";
}
