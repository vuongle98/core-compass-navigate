import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BotScheduleItem } from "@/pages/BotSchedule";

// Define the form schema
const scheduleFormSchema = z.object({
  schedule_type: z.enum(["daily", "weekly", "custom"]),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  days: z.array(z.string()).optional(),
  custom_cron: z.string().optional(),
  send_notification: z.boolean().default(false),
});

interface BotScheduleFormProps {
  onSubmit: (data: BotScheduleItem) => Promise<void> | void;
  isLoading?: boolean;
}

export function BotScheduleForm({
  onSubmit,
  isLoading = false,
}: BotScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BotScheduleItem>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      name: "",
      scheduled: false,
      description: "",
      type: "daily",
      time: "00:00",
      days: [],
      custom_cron: "",
      sendNotification: false,
    },
  });

  const scheduleType = form.watch("type");

  const handleSubmit = async (data: BotScheduleItem) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekdayOptions = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a schedule type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>How often should this bot run</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {scheduleType !== "custom" && (
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormDescription>
                  Time to run the bot (24-hour format)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {scheduleType === "weekly" && (
          <FormField
            control={form.control}
            name="days"
            render={() => (
              <FormItem>
                <div className="mb-2">
                  <FormLabel>Days of the Week</FormLabel>
                  <FormDescription>
                    Select which days to run the bot
                  </FormDescription>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {weekdayOptions.map((day) => (
                    <FormField
                      key={day.value}
                      control={form.control}
                      name="days"
                      render={({ field }) => (
                        <FormItem
                          key={day.value}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  const newValue = [
                                    ...(field.value || []),
                                    day.value,
                                  ];
                                  field.onChange(newValue);
                                } else {
                                  const newValue = field.value?.filter(
                                    (value) => value !== day.value
                                  );
                                  field.onChange(newValue);
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {day.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {scheduleType === "custom" && (
          <FormField
            control={form.control}
            name="custom_cron"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Cron Expression</FormLabel>
                <FormControl>
                  <Input placeholder="* * * * *" {...field} />
                </FormControl>
                <FormDescription>
                  Enter a valid cron expression (e.g., "0 12 * * 1-5" for
                  weekdays at noon)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="sendNotification"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Send Notifications</FormLabel>
                <FormDescription>
                  Receive notifications when the scheduled task runs
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? "Scheduling..." : "Schedule Bot"}
        </Button>
      </form>
    </Form>
  );
}
