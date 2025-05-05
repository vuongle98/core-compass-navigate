
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  key: string;
  isActive: boolean;
  environment: string[];
  userGroups: string[];
  percentage: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
