
import React, { useState, useEffect } from "react";
import GenericMultiSelect from "@/components/common/GenericMultiSelect";
import EnhancedApiService from "@/services/EnhancedApiService";
import { Role } from "@/types/Auth";

interface RoleSelectProps {
  value: Role[];
  onChange: (rawValue: Role[], value: any[]) => void;
  disabled?: boolean;
  /**
   * Optional field name for form submission.
   * If provided, onChange will return an object with this field as key and the selected IDs as value.
   * If not provided, onChange will return just the array of IDs.
   * Example: { roleIds: [1, 2, 3] } vs [1, 2, 3]
   */
  formField?: string;
}

const RoleSelect: React.FC<RoleSelectProps> = ({
  value,
  onChange,
  disabled,
  formField, // No default - only structure as object if explicitly requested
}) => {
  const [initialRoles, setInitialRoles] = useState<Role[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Fetch any initial role objects that are selected
  useEffect(() => {
    if (value && value.length > 0 && !initialLoaded) {
      const fetchInitialRoles = async () => {
        try {
          if (typeof value[0] === "number") {
            // For each role ID, fetch the corresponding role object
            const promises = value.map((id) =>
              EnhancedApiService.get<Role>(`/api/role/${id}`)
            );
            const responses = await Promise.all(promises);
            const roles = responses.map((response) => response) as Role[];
            setInitialRoles(roles);
          } else if (typeof value[0] === "object") {
            setInitialRoles(value as Role[]);
          }
        } catch (error) {
          console.error("Failed to fetch initial roles:", error);
        } finally {
          setInitialLoaded(true);
        }
      };

      fetchInitialRoles();
    } else if (value.length === 0) {
      setInitialLoaded(true);
    }
  }, [value, initialLoaded]);

  // Custom transform function to include initially selected roles
  const transformData = (data: any) => {
    if (!data) return [];

    const roles = Array.isArray(data) ? data : data.content || [];

    // If we have initial roles, merge them with the fetched data
    if (initialRoles.length > 0) {
      // Create a map of existing IDs to avoid duplicates
      const existingIds = new Set(roles.map((p: Role) => p.id));

      // Add any initial roles that aren't in the current data
      const filteredInitialRoles = initialRoles.filter(
        (p) => !existingIds.has(p.id)
      );

      return [...roles, ...filteredInitialRoles];
    }

    return roles;
  };

  // Handle form field transformation
  const handleRoleChange = (newValues: Role[]) => {
    // Convert to numbers if they're not already
    const numericValues = newValues.map((v) => typeof v.id === 'string' ? parseInt(v.id as string, 10) : v.id);
    onChange(newValues, numericValues);
  };

  return (
    <div className="role-select-wrapper mb-4">
      <h3 className="text-base font-semibold mb-1">Roles</h3>
      <GenericMultiSelect
        value={value}
        onChange={handleRoleChange}
        endpoint="/api/role"
        queryKey={["roles"]}
        getOptionLabel={(role: Role) => (
          <div>
            <div className="font-semibold">{role.name}</div>
            <div className="text-xs text-muted-foreground">
              {role.description}
            </div>
          </div>
        )}
        getOptionValue={(role: Role) => role?.id}
        transformData={transformData}
        label="" // Remove the internal label as we're using our own above
        disabled={disabled || !initialLoaded}
        placeholder={initialLoaded ? "Select roles..." : "Loading roles..."}
        maxHeight={400}
        showSelectedTags={true}
        multiple={true}
        showCheckboxes={true}
      />
    </div>
  );
};

export default RoleSelect;
