import React from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { User } from "@/types/Auth";
import { Option } from "@/types/Common";

interface UserSelectProps {
  value: User[];
  onChange: (rawValue: User[], value: number[]) => void;
  disabled?: boolean;
  /**
   * Optional field name for form submission.
   * If provided, onChange will return an object with this field as key and the selected IDs as value.
   * If not provided, onChange will return just the array of IDs.
   * Example: { permissionIds: [1, 2, 3] } vs [1, 2, 3]
   */
  formField?: string;
}

const PermissionSelect: React.FC<UserSelectProps> = ({
  value,
  onChange,
  disabled,
  formField, // No default - only structure as object if explicitly requested
}) => {
  // Convert current value to options format - Ensure all values are non-empty strings
  const selectedOptions = value.map((user) => {
    // Generate a safe value - ensure it's never empty
    const value = user.id
      ? user.id.toString()
      : `user-${user.username || "unnamed"}-${Date.now()}`;

    return {
      value,
      label: (
        <div>
          <div className="font-semibold">{user.username || "Unnamed User"}</div>
          <div className="text-xs text-muted-foreground">
            {user.email || "No description"}
          </div>
        </div>
      ),
      original: user,
    };
  });

  // Handle selection change
  const handleSelectChange = (selected: Option<User>[] | null) => {
    if (!selected) return;

    // Convert selected options back to User objects
    const selectedPermissions = selected.map((option) => option.original);

    // Convert to numbers if they're not already
    const numericValues = selectedPermissions.map((v) =>
      typeof v.id === "string" ? parseInt(v.id, 10) : (v.id as number)
    );
    onChange(selectedPermissions, numericValues);
  };

  const transformedOptions = (permissions: User[]) => {
    return permissions.map((user) => ({
      value: user.id.toString(),
      label: (
        <div>
          <div className="font-semibold">{user.username || "Unnamed User"}</div>
          <div className="text-xs text-muted-foreground">
            {user.email || "No description"}
          </div>
        </div>
      ),
      original: user,
    }));
  };

  return (
    <div className="user-select-wrapper mb-4">
      <h3 className="text-base font-semibold mb-1">Permissions</h3>
      <SearchableSelect
        endpoint="/api/user"
        queryKey={["user-select"]}
        value={selectedOptions}
        onChange={handleSelectChange}
        placeholder={"Select permissions..."}
        searchPlaceholder="Search permissions..."
        multiple={true}
        disabled={disabled}
        maxHeight={400}
        showSelectedTags={true}
        emptyMessage="No permissions found"
        transformData={transformedOptions}
      />
    </div>
  );
};

export default PermissionSelect;
