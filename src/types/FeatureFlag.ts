
export interface FeatureFlag {
  id?: number;
  key: string;
  description?: string;
  enabled: boolean;
  environments?: string[];
  roles?: string[];
  value?: string;
  type?: string;
}
