import React from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Role } from "@/types/Auth";
import { Option } from "@/types/Common";

interface RoleSelectProps {
  value: Role[];
  onChange: (rawValue: Role[], value: number[]) => void;
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
  // Convert current value to options format - Ensure all values are non-empty strings
  const selectedOptions = value.map((role) => {
    // Generate a safe value - ensure it's never empty
    const value = role.id
      ? role.id.toString()
      : `role-${role.name || "unnamed"}-${Date.now()}`;

    return {
      value,
      label: (
        <div>
          <div className="font-semibold">{role.name || "Unnamed Role"}</div>
          <div className="text-xs text-muted-foreground">
            {role.description || "No description"}
          </div>
        </div>
      ),
      original: role,
    };
  });

  // Handle selection change
  const handleChange = (selected: Option<Role>[] | null) => {
    if (!selected) return;

    // Convert selected options back to Role objects
    const selectedRoles = selected.map((option) => option.original as Role);
    // Convert to numbers if they're not already
    const numericValues = selectedRoles.map((v) =>
      typeof v.id === "string" ? parseInt(v.id as string, 10) : v.id
    );
    onChange(selectedRoles, numericValues);
  };

  const transformOptions = (roles: Role[]) => {
    return roles.map((role: Role) => {
      // Generate a safe value - ensure it's never empty
      const value = role.id
        ? role.id.toString()
        : `role-${role.name || "unnamed"}-${Date.now()}`;

      return {
        value,
        label: (
          <div>
            <div className="font-semibold">{role.name || "Unnamed Role"}</div>
            <div className="text-xs text-muted-foreground">
              {role.description || "No description"}
            </div>
          </div>
        ),
        original: role,
      };
    });
  };

  return (
    <div className="role-select-wrapper mb-4">
      <h3 className="text-base font-semibold mb-1">Roles</h3>
      <SearchableSelect
        endpoint="/api/role"
        queryKey={["role-select"]}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={"Select roles..."}
        searchPlaceholder="Search roles..."
        multiple={true}
        disabled={disabled}
        maxHeight={300}
        showSelectedTags={true}
        emptyMessage="No roles found"
        transformData={transformOptions}
      />
    </div>
  );
};

export default RoleSelect;
