
import React, { useState, useEffect } from "react";
import { SearchableSelect, Option } from "@/components/ui/searchable-select";
import EnhancedApiService, {
  ApiResponse,
  PaginatedData,
} from "@/services/EnhancedApiService";
import { Permission } from "@/types/Auth";
import useDebounce from "@/hooks/use-debounce";

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
  formField, // No default - only structure as object if explicitly requested
}) => {
  const [initialPermissions, setInitialPermissions] = useState<Permission[]>(
    []
  );
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch permissions with search
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        const response = await EnhancedApiService.getPaginated<Permission>(
          "/api/permission",
          {
            params: debouncedSearchQuery
              ? { search: debouncedSearchQuery }
              : {},
          }
        );

        const permissions = response.content || [];

        // Transform permissions to options format
        const permissionOptions = permissions.map((permission: Permission) => {
          // Generate a safe value - ensure it's never empty
          const value = permission.id ? 
            permission.id.toString() : 
            `permission-${permission.name || 'unnamed'}-${Date.now()}`;
            
          return {
            value,
            label: (
              <div>
                <div className="font-semibold">{permission.name || "Unnamed Permission"}</div>
                <div className="text-xs text-muted-foreground">
                  {permission.description || "No description"}
                </div>
              </div>
            ),
            original: permission,
          };
        });

        setOptions(permissionOptions);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [debouncedSearchQuery]);

  // Fetch any initial permission objects that are selected
  useEffect(() => {
    if (value && value.length > 0 && !initialLoaded) {
      const fetchInitialPermissions = async () => {
        try {
          if (typeof value[0] === "number") {
            // For each permission ID, fetch the corresponding permission object
            const promises = value.map((id) =>
              EnhancedApiService.get<Permission>(`/api/permission/${id}`)
            );
            const responses = await Promise.all(promises);
            const permissions = responses.map(
              (response) => response
            ) as Permission[];
            setInitialPermissions(permissions);
          } else if (typeof value[0] === "object") {
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

  // Convert current value to options format
  const selectedOptions = value.map((permission) => {
    // Generate a safe value - ensure it's never empty
    const value = permission.id ? 
      permission.id.toString() : 
      `permission-${permission.name || 'unnamed'}-${Date.now()}`;
      
    return {
      value,
      label: (
        <div>
          <div className="font-semibold">{permission.name || "Unnamed Permission"}</div>
          <div className="text-xs text-muted-foreground">
            {permission.description || "No description"}
          </div>
        </div>
      ),
      original: permission,
    };
  });

  // Handle selection change
  const handleChange = (selected: Option[] | null) => {
    if (!selected) return;

    // Convert selected options back to Permission objects
    const selectedPermissions = selected.map(
      (option) => option.original as Permission
    );
    // Convert to numbers if they're not already
    const numericValues = selectedPermissions.map((v) =>
      typeof v.id === "string" ? parseInt(v.id, 10) : (v.id as number)
    );
    onChange(selectedPermissions, numericValues);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="permission-select-wrapper mb-4">
      <h3 className="text-base font-semibold mb-1">Permissions</h3>
      <SearchableSelect
        options={[
          ...options,
          ...selectedOptions.filter(
            (selected) =>
              !options.some((option) => option.value === selected.value)
          ),
        ]}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={
          initialLoaded ? "Select permissions..." : "Loading permissions..."
        }
        searchPlaceholder="Search permissions..."
        multiple={true}
        disabled={disabled || !initialLoaded}
        maxHeight={400}
        showSelectedTags={true}
        onSearch={handleSearch}
        isLoading={isLoading}
        emptyMessage="No permissions found"
      />
    </div>
  );
};

export default PermissionSelect;
