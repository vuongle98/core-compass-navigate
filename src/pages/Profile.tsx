import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Pencil, Save, User, Settings } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserService from "@/services/UserService";
import UserSettingsComponent from "@/components/users/UserSettingsComponent";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("Invalid email address"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("profile");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
      phone: user?.profile?.phone || "",
      address: user?.profile?.address || "",
      email: user?.email || "",
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user?.profile?.firstName || "",
        lastName: user?.profile?.lastName || "",
        phone: user?.profile?.phone || "",
        address: user?.profile?.address || "",
        email: user?.email || "",
      });

      // Set avatar URL if available
      if (user.profile?.avatarUrl) {
        setAvatarUrl(user.profile.avatarUrl);
      }
    }
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      if (user?.id) {
        await UserService.updateProfile(user.id, values);

        // Update local user data
        if (updateUser && user) {
          updateUser({
            ...user,
            email: values.email,
            profile: {
              ...user.profile,
              firstName: values.firstName,
              lastName: values.lastName,
              phone: values.phone,
              address: values.address,
            },
          });
        }

        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        throw new Error("User ID not found");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <Breadcrumbs />
      <PageHeader
        title="User Profile"
        description="Manage your account and preferences"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Avatar className="h-24 w-24 border-2 border-primary/10">
                      {avatarUrl ? (
                        <AvatarImage
                          src={avatarUrl}
                          alt={user?.username || "User"}
                        />
                      ) : (
                        <AvatarFallback className="text-xl">
                          {user?.username?.substring(0, 2) || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="text-center">
                      <h3 className="text-lg font-medium">
                        {user?.username || "User"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user?.email || ""}
                      </p>
                    </div>

                    <div className="w-full pt-3">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Role</span>
                          <span className="font-medium">
                            {user?.roles.map((role) => role.name).join(", ") ||
                              ""}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">
                            Join Date
                          </span>
                          <span className="font-medium">
                            {user?.joinDate
                              ? new Date(user.joinDate).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">
                            Last Login
                          </span>
                          <span className="font-medium">
                            {user?.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <CardTitle className="text-xl">Profile Information</CardTitle>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 pt-2"
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            type="button"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">
                            First Name
                          </Label>
                          <p className="font-medium">
                            {user?.profile?.firstName || "-"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">
                            Last Name
                          </Label>
                          <p className="font-medium">
                            {user?.profile?.lastName || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{user?.email || "-"}</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Phone</Label>
                          <p className="font-medium">
                            {user?.profile?.phone || "-"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">
                            Address
                          </Label>
                          <p className="font-medium">
                            {user?.profile?.address || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <UserSettingsComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
