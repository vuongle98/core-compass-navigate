
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import useUserSettingsStore from "@/store/useUserSettingsStore";
import { useForm } from "react-hook-form";
import LoggingService from '@/services/LoggingService';

interface UserSettingsFormValues {
  filtersExpanded: boolean;
  loggingEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export const UserSettingsComponent = () => {
  const { settings, setFilterExpanded, setLoggingEnabled, setTheme } = useUserSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<UserSettingsFormValues>({
    defaultValues: {
      filtersExpanded: settings.filters.expanded,
      loggingEnabled: settings.loggingEnabled,
      theme: settings.theme,
    },
  });
  
  React.useEffect(() => {
    form.reset({
      filtersExpanded: settings.filters.expanded,
      loggingEnabled: settings.loggingEnabled,
      theme: settings.theme,
    });
  }, [settings, form]);
  
  const onSubmit = async (values: UserSettingsFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Update settings
      setFilterExpanded(values.filtersExpanded);
      setLoggingEnabled(values.loggingEnabled);
      setTheme(values.theme);
      
      // Apply log settings immediately
      LoggingService.setActivityTracking(values.loggingEnabled);
      
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">User Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="filtersExpanded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div>
                      <FormLabel className="text-base">Show Filters Expanded</FormLabel>
                      <FormDescription>
                        Always show filter options expanded when available
                      </FormDescription>
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
                control={form.control}
                name="loggingEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div>
                      <FormLabel className="text-base">Activity Tracking</FormLabel>
                      <FormDescription>
                        Track user activity for analytics and personalization
                      </FormDescription>
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
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your preferred application theme
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserSettingsComponent;
