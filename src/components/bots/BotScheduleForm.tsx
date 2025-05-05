import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Bot, BotScheduledMessage } from "@/types/Bot";

// Define the form schema
const scheduleFormSchema = z.object({
  botId: z.number().min(1, "Bot ID is required"),
  chatId: z.string().min(1, "Chat ID is required"),
  messageText: z.string().min(1, "Message text is required"),
  description: z.string().optional(),
  isRecurring: z.boolean(),
  recurrencePattern: z.string().optional(),
  isSent: z.boolean(),
  scheduledTime: z.string().min(1, "Scheduled date and time is required"),
});

interface BotScheduleFormProps {
  onSubmit: (data: Partial<BotScheduledMessage>) => Promise<void> | void;
  isLoading?: boolean;
  botInfo: Bot;
}

export function BotScheduleForm({
  onSubmit,
  isLoading = false,
  botInfo,
}: BotScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      botId: botInfo.id,
      chatId: "",
      messageText: "",
      description: "",
      isRecurring: false,
      recurrencePattern: "",
      isSent: false,
      scheduledTime: "",
    },
  });

  const isRecurring = form.watch("isRecurring");

  const handleSubmit = async (data: Partial<BotScheduledMessage>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="botId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bot Info</FormLabel>
              <FormControl>
                <div className="p-2 border rounded-md">
                  <p>
                    <strong>ID:</strong> {botInfo.id}
                  </p>
                  <p>
                    <strong>Name:</strong> {botInfo.name}
                  </p>
                  <p>
                    <strong>Description:</strong> {botInfo.description || "N/A"}
                  </p>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chatId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chat ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter Chat ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="messageText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message Text</FormLabel>
              <FormControl>
                <Input placeholder="Enter message text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Optional description for the message"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Is Recurring</FormLabel>
            </FormItem>
          )}
        />

        {isRecurring && (
          <FormField
            control={form.control}
            name="recurrencePattern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurrence Pattern</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter recurrence pattern (e.g., daily, weekly)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="scheduledTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheduled Date & Time</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
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
