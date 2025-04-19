import React from "react";
import GenericMultiSelect from "@/components/GenericMultiSelect";

export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  module: string;
}

interface PermissionSelectProps {
  value: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
}

const PermissionSelect: React.FC<PermissionSelectProps> = ({ value, onChange, disabled }) => {
  return (
    <GenericMultiSelect
      value={value}
      onChange={onChange}
      endpoint="/api/permission"
      queryKey={["permissions"]}
      getOptionLabel={(permission: Permission) => (
        <div>
          <div className="font-semibold">{permission.name}</div>
          <div className="text-xs text-muted-foreground">{permission.description}</div>
        </div>
      )}
      getOptionValue={(permission: Permission) => permission.id}
      label="Permissions"
      disabled={disabled}
      placeholder="Select permissions..."
    />
  );
};

export default PermissionSelect;
