import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Key,
  MailCheck,
  Settings,
  ToggleLeft,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  ApiKey,
  Configuration as ConfigurationItem,
} from "@/types/Configuration";

const Configuration = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [configurations, setConfigurations] = useState<ConfigurationItem[]>([
    {
      id: 1,
      key: "SYSTEM_NAME",
      value: "Core Application",
      type: "String",
      lastModified: "2025-03-15",
      environment: "All",
      description: "Name of the application displayed in UI elements",
    },
    {
      id: 2,
      key: "MAX_FILE_SIZE",
      value: "5242880",
      type: "Number",
      lastModified: "2025-03-20",
      environment: "All",
      description: "Maximum allowed file size in bytes",
    },
    {
      id: 3,
      key: "SMTP_SERVER",
      value: "smtp.example.com",
      type: "String",
      lastModified: "2025-04-01",
      environment: "Production",
      description: "SMTP server address for sending emails",
    },
    {
      id: 4,
      key: "DEBUG_MODE",
      value: "true",
      type: "Boolean",
      lastModified: "2025-04-05",
      environment: "Development",
      description: "Enable detailed debugging information",
    },
    {
      id: 5,
      key: "API_TIMEOUT",
      value: "30000",
      type: "Number",
      lastModified: "2025-04-10",
      environment: "All",
      description: "API request timeout in milliseconds",
    },
    {
      id: 6,
      key: "DEFAULT_LANGUAGE",
      value: "en-US",
      type: "String",
      lastModified: "2025-04-12",
      environment: "All",
      description: "Default application language",
    },
    {
      id: 7,
      key: "SESSION_TIMEOUT",
      value: "3600",
      type: "Number",
      lastModified: "2025-04-14",
      environment: "All",
      description: "User session timeout in seconds",
    },
  ]);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 1,
      name: "Production API",
      key: "pk_live_*****************************abc",
      createdAt: "2025-01-15",
      lastUsed: "2025-04-14",
      status: "active",
    },
    {
      id: 2,
      name: "Development API",
      key: "pk_test_***************************xyz",
      createdAt: "2025-02-20",
      lastUsed: "2025-04-10",
      status: "active",
    },
    {
      id: 3,
      name: "Analytics Integration",
      key: "ana_***************************123",
      createdAt: "2025-03-05",
      lastUsed: "2025-03-30",
      status: "inactive",
    },
  ]);

  const handleToggleMaintenance = (enabled: boolean) => {
    setMaintenanceMode(enabled);
    toast.success(`Maintenance mode ${enabled ? "enabled" : "disabled"}`);
  };

  const handleSaveSettings = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  const configColumns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: ConfigurationItem) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
    },
    { header: "Key", accessorKey: "key" as const },
    { header: "Value", accessorKey: "value" as const },
    { header: "Type", accessorKey: "type" as const },
    {
      header: "Environment",
      accessorKey: "environment" as const,
      cell: (item: ConfigurationItem) => {
        const env = item.environment;
        let bgColor = "bg-blue-100 text-blue-800";

        if (env === "Production") {
          bgColor = "bg-green-100 text-green-800";
        } else if (env === "Development") {
          bgColor = "bg-yellow-100 text-yellow-800";
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${bgColor}`}>
            {env}
          </span>
        );
      },
    },
    { header: "Last Modified", accessorKey: "lastModified" as const },
    {
      header: "Description",
      accessorKey: "description" as const,
      cell: (item: ConfigurationItem) => (
        <p className="max-w-xs truncate">{item.description}</p>
      ),
    },
  ];

  const apiKeyColumns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: ApiKey) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
    },
    { header: "Name", accessorKey: "name" as const },
    { header: "Key", accessorKey: "key" as const },
    { header: "Created", accessorKey: "createdAt" as const },
    { header: "Last Used", accessorKey: "lastUsed" as const },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: ApiKey) => {
        const status = item.status;
        let variant: "default" | "secondary" | "destructive" | "outline" =
          "default";

        if (status === "inactive") {
          variant = "secondary";
        } else if (status === "expired") {
          variant = "destructive";
        }

        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: ApiKey) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            Revoke
          </Button>
          <Button size="sm" variant="outline">
            Regenerate
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Configuration"
          description="System configuration parameters"
        />

        <div className="mt-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-5 gap-2">
              <TabsTrigger value="general">
                <Settings className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="api">
                <Key className="mr-2 h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="features">
                <ToggleLeft className="mr-2 h-4 w-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="email">
                <MailCheck className="mr-2 h-4 w-4" />
                Email/SMS
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Wrench className="mr-2 h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure basic application settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="app-name">Application Name</Label>
                      <Input id="app-name" defaultValue="Core Application" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="app-url">Application URL</Label>
                      <Input
                        id="app-url"
                        defaultValue="https://app.example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Default Timezone</Label>
                      <Select defaultValue="UTC">
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">
                            UTC (Coordinated Universal Time)
                          </SelectItem>
                          <SelectItem value="EST">
                            EST (Eastern Standard Time)
                          </SelectItem>
                          <SelectItem value="PST">
                            PST (Pacific Standard Time)
                          </SelectItem>
                          <SelectItem value="CET">
                            CET (Central European Time)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Default Language</Label>
                      <Select defaultValue="en-US">
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        When enabled, users will see a maintenance page
                      </p>
                    </div>
                    <Switch
                      checked={maintenanceMode}
                      onCheckedChange={handleToggleMaintenance}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSaveSettings("General")}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Settings</CardTitle>
                  <CardDescription>
                    Configure date, time and number formats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select defaultValue="MM/DD/YYYY">
                        <SelectTrigger id="date-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time-format">Time Format</Label>
                      <Select defaultValue="12h">
                        <SelectTrigger id="time-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="first-day">First Day of Week</Label>
                      <Select defaultValue="sunday">
                        <SelectTrigger id="first-day">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sunday">Sunday</SelectItem>
                          <SelectItem value="monday">Monday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSaveSettings("Regional")}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>API Keys</CardTitle>
                      <CardDescription>
                        Manage API keys for third-party integrations
                      </CardDescription>
                    </div>
                    <Button>
                      <Key className="mr-2 h-4 w-4" />
                      Generate New Key
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={apiKeys}
                    columns={apiKeyColumns}
                    pagination={true}
                    showAddButton={false}
                    title=""
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Third-party Integrations</CardTitle>
                  <CardDescription>
                    Configure external service connections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripe-key">Stripe API Key</Label>
                      <Input
                        id="stripe-key"
                        type="password"
                        defaultValue="sk_test_************************"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="google-key">Google API Key</Label>
                      <Input
                        id="google-key"
                        type="password"
                        defaultValue="AIza***********************"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSaveSettings("Integrations")}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>
                    Enable or disable specific features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">New Dashboard UI</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable the redesigned dashboard interface
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Advanced Analytics</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable advanced analytics and reporting features
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">AI Recommendations</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable AI-powered content recommendations
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">
                          Real-time Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable push notifications for real-time updates
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Beta Features</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable experimental features (may be unstable)
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSaveSettings("Features")}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>
                    Configure email delivery settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input id="smtp-host" defaultValue="smtp.example.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input id="smtp-port" defaultValue="587" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">SMTP Username</Label>
                      <Input
                        id="smtp-user"
                        defaultValue="notifications@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-pass">SMTP Password</Label>
                      <Input
                        id="smtp-pass"
                        type="password"
                        defaultValue="********"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="from-email">From Email</Label>
                      <Input
                        id="from-email"
                        defaultValue="noreply@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="from-name">From Name</Label>
                      <Input id="from-name" defaultValue="Example App" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Switch id="use-ssl" defaultChecked />
                    <Label htmlFor="use-ssl">Use SSL/TLS</Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Test Connection</Button>
                  <Button onClick={() => handleSaveSettings("Email")}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SMS Configuration</CardTitle>
                  <CardDescription>
                    Configure SMS delivery settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sms-provider">SMS Provider</Label>
                      <Select defaultValue="twilio">
                        <SelectTrigger id="sms-provider">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="nexmo">Nexmo/Vonage</SelectItem>
                          <SelectItem value="sns">AWS SNS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account-sid">Account SID</Label>
                      <Input
                        id="account-sid"
                        defaultValue="AC***************************"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="auth-token">Auth Token</Label>
                      <Input
                        id="auth-token"
                        type="password"
                        defaultValue="***************************"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="from-number">From Number</Label>
                      <Input id="from-number" defaultValue="+1234567890" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Test SMS</Button>
                  <Button onClick={() => handleSaveSettings("SMS")}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>
                    View and modify system configuration parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={configurations}
                    columns={configColumns}
                    title="Configuration Parameters"
                    pagination={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Configuration;
