
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailViewModal } from "@/components/ui/detail-view-modal";
import {
  Pencil,
  Save,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  User,
} from "lucide-react";
import EnhancedApiService from "@/services/EnhancedApiService";
import { UserInfo } from "@/pages/Users";
import { useQuery } from "@tanstack/react-query";
import RoleSelect from "./RoleSelect";
import { Role } from "@/types/Auth";

interface UserProfileProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const roleFormSchema = z.object({
  roleIds: z.array(z.number()).optional()
});
type RoleFormValues = z.infer<typeof roleFormSchema>;

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const securityFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string(),
    // .min(8, "Password must be at least 8 characters")
    // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    // .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SecurityFormValues = z.infer<typeof securityFormSchema>;

export function UserProfile({ userId, isOpen, onClose }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Mock user data - in a real app, you would fetch this from an API
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userInfo", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await EnhancedApiService.get<UserInfo>(
        `/api/user/${userId}/profile`
      );
      return response;
    },
  });

  const user = userData;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
      phone: user?.profile?.phone || "",
    },
  });

  const roleForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      roleIds: []
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username || "",
        email: user.email || "",
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        phone: user.profile?.phone || "",
      });
    }
  }, [user, profileForm]);

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleRoleEdit = () => {
    setIsEditingRole(true);
  };

  const handleSave = (data: ProfileFormValues) => {
    // Here you would call an API to update the user profile
    delete data.username; // Assuming username is not editable
    delete data.email; // Assuming email is not editable
    EnhancedApiService.put(`/api/user/${userId}/profile`, data)
      .then(() => {
        // setUser({ ...user, ...data });
        toast.success("Profile updated successfully");
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Failed to update profile:", error);
        toast.error("Failed to update profile", {
          description: "There was an error updating your profile information.",
        });
      });
  };

  const handlePasswordChange = (data: SecurityFormValues) => {
    // Here you would call an API to update the password
    EnhancedApiService.put(`/api/user/${userId}/change-password`, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    })
      .then(() => {
        toast.success("Password changed successfully");
        securityForm.reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      })
      .catch((error) => {
        console.error("Failed to change password:", error);
        toast.error("Failed to change password", {
          description: "There was an error changing your password.",
        });
      });
  };

  const onSelectRoleChange = (rawValue: any[], numericIds: number[]) => {
    console.log("Selected roles:", rawValue, numericIds);
    roleForm.setValue(
      "roleIds",
      numericIds
    );
    roleForm.trigger("roleIds");
  };

  const handleRoleChange = (data: RoleFormValues) => {
    // Here you would call an API to update the user roles
    EnhancedApiService.put(`/api/user/${userId}`, {
      roleIds: data.roleIds,
    })
      .then(() => {
        toast.success("Roles updated successfully");
        // setUser({ ...user, roles: data.roleIds });
      })
      .catch((error) => {
        console.error("Failed to update roles:", error);
        toast.error("Failed to update roles", {
          description: "There was an error updating user roles.",
        });
      });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getFullName = (user: UserInfo) => {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    if (user.profile?.firstName) {
      return user.profile.firstName;
    }
    if (user.profile?.lastName) {
      return user.profile.lastName;
    }
    return user.username;
  };

  return (
    <DetailViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
      size="full"
      showCloseButton={false}
    >
      <div className="space-y-6 relative">
        {user && (
          <Card className="mb-4">
            <CardHeader className="flex flex-col md:flex-row items-center gap-4 pb-2">
              <Avatar className="h-24 w-24 border shadow">
                <AvatarImage
                  src={user?.profile?.avatarUrl}
                  alt={getFullName(user)}
                />
                <AvatarFallback className="text-xl">
                  {getInitials(getFullName(user))}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-1">{getFullName(user)}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-4 w-4" /> {user.username}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-4 w-4" /> {user.email}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Building className="h-4 w-4" /> IT
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-4 w-4" /> {user.profile?.phone}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" /> {user.roles.join(", ")}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2 text-xs text-muted-foreground">
                  <span>
                    Last Login:{" "}
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "-"}
                  </span>
                  <span>
                    Created:{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {user && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="roles">
                <Building className="h-4 w-4 mr-2" />
                Roles
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="pt-4">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information
                      </CardDescription>
                    </div>
                    {!isEditing && (
                      <Button variant="outline" onClick={handleEdit}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form
                      id="profile-form"
                      onSubmit={profileForm.handleSubmit(handleSave)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  placeholder="Username"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  type="email"
                                  placeholder="Email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  placeholder="First Name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  placeholder="Last Name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  placeholder="Phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                </CardContent>
                {isEditing && (
                  <CardFooter className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        profileForm.reset();
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" form="profile-form">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="security" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...securityForm}>
                    <form
                      id="security-form"
                      onSubmit={securityForm.handleSubmit(handlePasswordChange)}
                      className="space-y-4"
                    >
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter your current password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter your new password"
                              />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters and include
                              at least one uppercase letter, one lowercase
                              letter, and one number.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Confirm your new password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-end pt-2">
                  <Button type="submit" form="security-form">
                    <Save className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="roles" className="pt-4">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>User Roles</CardTitle>
                      <CardDescription>
                        Assign roles to the user
                      </CardDescription>
                    </div>
                    {!isEditing && (
                      <Button variant="outline" onClick={handleRoleEdit}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...roleForm}>
                    <form
                      id="role-form"
                      onSubmit={roleForm.handleSubmit(handleRoleChange)}
                      className="space-y-4"
                    >
                      <FormField
                        control={roleForm.control}
                        name="roleIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Roles</FormLabel>
                            <FormControl>
                              <RoleSelect
                                value={(field.value || []).map(
                                  (id) => ({ id } as any)
                                )}
                                onChange={onSelectRoleChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
                {isEditingRole && (
                  <CardFooter className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        roleForm.reset();
                        setIsEditingRole(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" form="role-form">
                      <Save className="h-4 w-4 mr-2" />
                      Save Roles
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DetailViewModal>
  );
}
