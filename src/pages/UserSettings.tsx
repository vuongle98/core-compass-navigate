import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
} from "@/components/ui/form";
import { Loader2, Bell, Shield, Eye, Save } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  newFeatures: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
});

const privacySchema = z.object({
  profileVisibility: z
    .enum(["public", "private", "contacts"])
    .default("public"),
  activityVisibility: z
    .enum(["public", "private", "contacts"])
    .default("contacts"),
  allowDataCollection: z.boolean().default(true),
});

const securitySchema = z.object({
  twoFactorAuth: z.boolean().default(false),
  rememberDevices: z.boolean().default(true),
  sessionTimeout: z
    .enum(["30m", "1h", "2h", "4h", "8h", "always"])
    .default("4h"),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;
type PrivacyFormValues = z.infer<typeof privacySchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;

const UserSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("notifications");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification settings form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      newFeatures: true,
      securityAlerts: true,
    },
  });

  // Privacy settings form
  const privacyForm = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profileVisibility: "public",
      activityVisibility: "contacts",
      allowDataCollection: true,
    },
  });

  // Security settings form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      twoFactorAuth: false,
      rememberDevices: true,
      sessionTimeout: "4h",
    },
  });

  const onSubmitNotifications = async (values: NotificationFormValues) => {
    setIsSubmitting(true);
    try {
      // Mock API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Notification settings updated successfully");
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast.error("Failed to update notification settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPrivacy = async (values: PrivacyFormValues) => {
    setIsSubmitting(true);
    try {
      // Mock API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Privacy settings updated successfully");
    } catch (error) {
      console.error("Failed to update privacy settings:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitSecurity = async (values: SecurityFormValues) => {
    setIsSubmitting(true);
    try {
      // Mock API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Security settings updated successfully");
    } catch (error) {
      console.error("Failed to update security settings:", error);
      toast.error("Failed to update security settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <Breadcrumbs />
      <PageHeader
        title="User Settings"
        description="Configure your account preferences"
      />

      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form
                    onSubmit={notificationForm.handleSubmit(
                      onSubmitNotifications
                    )}
                    className="space-y-6"
                  >
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Email Notifications
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Receive updates and alerts via email
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Push Notifications
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Receive updates and alerts via push notifications
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Marketing Emails
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Receive marketing and promotional emails
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="newFeatures"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              New Features
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Get notified about new features and updates
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="securityAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Security Alerts
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Get notified about security-related events
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Preferences
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...privacyForm}>
                  <form
                    onSubmit={privacyForm.handleSubmit(onSubmitPrivacy)}
                    className="space-y-6"
                  >
                    {/* Privacy settings fields */}
                    <Button
                      type="submit"
                      className="flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Privacy Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form
                    onSubmit={securityForm.handleSubmit(onSubmitSecurity)}
                    className="space-y-6"
                  >
                    <FormField
                      control={securityForm.control}
                      name="twoFactorAuth"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Two-Factor Authentication
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Security Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserSettings;
