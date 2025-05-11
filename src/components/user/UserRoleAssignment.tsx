import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Role } from "@/types/Auth";
import { usePermissions } from "@/hooks/use-permissions";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import RoleSelect from "../searchable-select/RoleSelect";
import UserService from "@/services/UserService";

interface UserRoleAssignmentProps {
  userId: number;
  currentRoles?: Role[];
  onSuccess?: () => void;
}

export function UserRoleAssignment({
  userId,
  currentRoles = [],
  onSuccess,
}: UserRoleAssignmentProps) {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(currentRoles);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hasRole } = usePermissions();

  const canAssignRoles = hasRole("SUPER_ADMIN");

  const handleSubmit = async () => {
    if (!canAssignRoles) {
      toast.error("You don't have permission to assign roles");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await UserService.updateUser(userId, {
        roleIds: selectedRoles.map((role) => role.id),
      });

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

  const handleSelectRoleChange = (roles: Role[], roleIds: number[]) => {
    setSelectedRoles(roles);
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

        {isSaving ? (
          <div className="flex justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            <RoleSelect
              value={selectedRoles || []}
              onChange={handleSelectRoleChange}
              disabled={isSaving}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
