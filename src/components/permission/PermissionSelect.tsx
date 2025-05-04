
import React, { useState, useEffect } from "react";
import GenericMultiSelect from "@/components/common/GenericMultiSelect";
import EnhancedApiService from "@/services/EnhancedApiService";
import { Permission } from "@/types/Auth";

interface PermissionSelectProps {
  value: Permission[];
  onChange: (rawValue: Permission[], value: number[]) => void;
  disabled?: boolean;
  /**
   * Optional field name for form submission. 
   * If provided, onChange will return an object with this field as key and the selected IDs as value.
   * If not provided, onChange will return just the array of IDs.
   * Example: { permissionIds: [1, 2, 3] } vs [1, 2, 3]
   */
  formField?: string;
}

const PermissionSelect: React.FC<PermissionSelectProps> = ({
  value,
  onChange,
  disabled,
  formField // No default - only structure as object if explicitly requested
}) => {
  const [initialPermissions, setInitialPermissions] = useState<Permission[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Fetch any initial permission objects that are selected
  useEffect(() => {
    if (value && value.length > 0 && !initialLoaded) {
      const fetchInitialPermissions = async () => {
        try {
          if (typeof value[0] === 'number') {
            // For each permission ID, fetch the corresponding permission object
            const promises = value.map(id => EnhancedApiService.get<Permission>(`/api/permission/${id}`));
            const responses = await Promise.all(promises);
            const permissions = responses.map(response => response) as Permission[];
            setInitialPermissions(permissions);
          } else if (typeof value[0] === 'object') {
            setInitialPermissions(value as Permission[]);
          }
        } catch (error) {
          console.error("Failed to fetch initial permissions:", error);
        } finally {
          setInitialLoaded(true);
        }
      };

      fetchInitialPermissions();
    } else if (value.length === 0) {
      setInitialLoaded(true);
    }
  }, [value, initialLoaded]);

  // Custom transform function to include initially selected permissions
  const transformData = (data: any) => {
    if (!data) return [];

    const permissions = Array.isArray(data) ? data : data.content || [];

    // If we have initial permissions, merge them with the fetched data
    if (initialPermissions.length > 0) {
      // Create a map of existing IDs to avoid duplicates
      const existingIds = new Set(permissions.map((p: Permission) => p.id));

      // Add any initial permissions that aren't in the current data
      const filteredInitialPermissions = initialPermissions.filter(
        p => !existingIds.has(p.id)
      );

      return [...permissions, ...filteredInitialPermissions];
    }

    return permissions;
  };

  // Handle form field transformation
  const handlePermissionChange = (newValues: Permission[]) => {
    // Convert to numbers if they're not already
    const numericValues = newValues.map(v => typeof v.id === 'string' ? parseInt(v.id, 10) : v.id as number);
    onChange(newValues, numericValues);
  };

  return (
    <div className="permission-select-wrapper mb-4">
      <h3 className="text-base font-semibold mb-1">Permissions</h3>
      <GenericMultiSelect
        value={value}
        onChange={handlePermissionChange}
        endpoint="/api/permission"
        queryKey={["permissions"]}
        getOptionLabel={(permission: Permission) => (
          <div>
            <div className="font-semibold">{permission.name}</div>
            <div className="text-xs text-muted-foreground">{permission.description}</div>
          </div>
        )}
        getOptionValue={(permission: Permission) => permission.id}
        transformData={transformData}
        label="" // Remove the internal label as we're using our own above
        disabled={disabled || !initialLoaded}
        placeholder={initialLoaded ? "Select permissions..." : "Loading permissions..."}
        maxHeight={400}
        showSelectedTags={true}
        multiple={true}
        showCheckboxes={true}
      />
    </div>
  );
};

export default PermissionSelect;
