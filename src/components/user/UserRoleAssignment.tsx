
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Role } from "@/types/Auth";
import { usePermissions } from "@/hooks/use-permissions";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EnhancedApiService from "@/services/EnhancedApiService";

interface UserRoleAssignmentProps {
  userId: string;
  currentRoles?: string[];
  onSuccess?: () => void;
}

export function UserRoleAssignment({
  userId,
  currentRoles = [],
  onSuccess,
}: UserRoleAssignmentProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hasPermission } = usePermissions();

  const canAssignRoles = hasPermission("role:assign");

  useEffect(() => {
    const loadRoles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await EnhancedApiService.get<Role[]>("/api/role");
        setRoles(response);
      } catch (err) {
        console.error("Error loading roles:", err);
        setError("An error occurred while loading roles");
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
  }, []);

  // Update selected roles when currentRoles prop changes
  useEffect(() => {
    setSelectedRoles(currentRoles);
  }, [currentRoles]);

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async () => {
    if (!canAssignRoles) {
      toast.error("You don't have permission to assign roles");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await EnhancedApiService.put(
        `/api/users/${userId}/roles`,
        {
          roles: selectedRoles,
        }
      );

      toast.success("Roles updated successfully");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error updating roles:", err);
      setError("An error occurred while updating roles");
      toast.error("An error occurred while updating roles");
    } finally {
      setIsSaving(false);
    }
  };

  if (!canAssignRoles) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to assign roles to users.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Roles</CardTitle>
        <CardDescription>
          Assign roles to control user permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {roles.map((role) => (
              <div key={String(role.id)} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${String(role.id)}`}
                  checked={selectedRoles.includes(String(role.id))}
                  onCheckedChange={() => toggleRole(String(role.id))}
                />
                <label
                  htmlFor={`role-${String(role.id)}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <div>{role.name}</div>
                  <p className="text-xs text-muted-foreground">
                    {role.description || `${role.code} role`}
                  </p>
                </label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading || isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
