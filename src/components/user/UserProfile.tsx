import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserRoleAssignment } from "@/components/user/UserRoleAssignment";
import { User, UserProfile as UserProfileType } from "@/types/Auth";
import UserService from "@/services/UserService";
import {
  Loader2,
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface UserProfileProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (isOpen && userId) {
      console.log("ddodo");
      setIsLoading(true);
      UserService.getUser(userId)
        .then((data) => {
          setUser(data);
          // Initialize form with profile data if it exists
          if (data.profile) {
            form.reset({
              firstName: data.profile.firstName || "",
              lastName: data.profile.lastName || "",
              phone: data.profile.phone || "",
              address: data.profile.address || "",
            });
          }
        })
        .catch((error) => {
          console.error("Failed to fetch user:", error);
          toast.error("Failed to load user details");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userId, isOpen, form]);

  const handleSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await UserService.updateProfile(user.id, values);
      toast.success("Profile updated successfully");

      // Update local user data with new profile info
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          profile: {
            ...(prev.profile || {}),
            ...values,
            id: prev.profile?.id || 0,
          },
        };
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getUserInitials = () => {
    if (!user) return "?";
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`;
    }
    return user.username ? user.username[0].toUpperCase() : "?";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">User Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user.avatar ? (
                  <AvatarImage
                    src={user.avatar}
                    alt={user.username || "User"}
                  />
                ) : (
                  <AvatarFallback className="text-lg">
                    {getUserInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {user.profile?.firstName && user.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.username || "Unknown User"}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm">
                  <Mail className="mr-1 h-3.5 w-3.5" />
                  <span>{user.email || "No email provided"}</span>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  <span>
                    Joined:{" "}
                    {user.joinDate
                      ? new Date(user.joinDate).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-1"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Profile Details</span>
                </TabsTrigger>
                <TabsTrigger value="roles" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Roles</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter first name"
                                {...field}
                              />
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
                              <Input placeholder="Enter last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter phone number"
                              {...field}
                            />
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
                            <Input placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                      >
                        {isSubmitting && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Save Profile
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="roles">
                <div className="space-y-4">
                  <UserRoleAssignment
                    userId={userId}
                    currentRoles={user.roles}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            User not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
