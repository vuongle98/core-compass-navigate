import React, { useState, useEffect } from "react";
import { SearchableSelect, Option } from "@/components/ui/searchable-select";
import EnhancedApiService from "@/services/EnhancedApiService";
import { Role } from "@/types/Auth";
import useDebounce from "@/hooks/use-debounce";

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
  const [initialRoles, setInitialRoles] = useState<Role[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch roles with search
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true);
        const response = await EnhancedApiService.getPaginated<Role>("/api/role", {
          params: debouncedSearchQuery ? { search: debouncedSearchQuery } : {},
        });

        const roles = response.content || [];

        // Transform roles to options format - Ensure all values are non-empty strings
        const roleOptions = roles.map((role: Role) => {
          // Generate a safe value - ensure it's never empty
          const value = role.id ? 
            role.id.toString() : 
            `role-${role.name || 'unnamed'}-${Date.now()}`;
          
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

        setOptions(roleOptions);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [debouncedSearchQuery]);

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

  // Convert current value to options format - Ensure all values are non-empty strings
  const selectedOptions = value.map((role) => {
    // Generate a safe value - ensure it's never empty
    const value = role.id ? 
      role.id.toString() : 
      `role-${role.name || 'unnamed'}-${Date.now()}`;
    
    return {
      value,
      label: (
        <div>
          <div className="font-semibold">{role.name || "Unnamed Role"}</div>
          <div className="text-xs text-muted-foreground">{role.description || "No description"}</div>
        </div>
      ),
      original: role,
    };
  });

  // Handle selection change
  const handleChange = (selected: Option[] | null) => {
    if (!selected) return;

    // Convert selected options back to Role objects
    const selectedRoles = selected.map((option) => option.original as Role);
    // Convert to numbers if they're not already
    const numericValues = selectedRoles.map((v) =>
      typeof v.id === "string" ? parseInt(v.id as string, 10) : v.id
    );
    onChange(selectedRoles, numericValues);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="role-select-wrapper mb-4">
      <h3 className="text-base font-semibold mb-1">Roles</h3>
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
        placeholder={initialLoaded ? "Select roles..." : "Loading roles..."}
        searchPlaceholder="Search roles..."
        multiple={true}
        disabled={disabled || !initialLoaded}
        maxHeight={300}
        showSelectedTags={true}
        onSearch={handleSearch}
        isLoading={isLoading}
        emptyMessage="No roles found"
      />
    </div>
  );
};

export default RoleSelect;
