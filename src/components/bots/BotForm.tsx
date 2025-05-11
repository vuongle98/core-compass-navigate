import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot } from "@/types/Bot";

// Define the form schema with conditional fields based on bot type
const botFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  apiToken: z.string().min(10, "Please enter a valid Telegram bot token"),
  configuration: z.object({
    updateMethod: z.enum(["WEBHOOK", "LONG_POLLING"]),
    webhookUrl: z
      .string()
      .url("Please enter a valid URL")
      .optional()
      .or(z.literal("")),
    pollingInterval: z.number().min(5).optional(),
  }),
  description: z.string().optional(),
});

interface BotFormProps {
  initialData?: Partial<Bot>;
  onSubmit: (data: Bot) => Promise<void> | void;
  isLoading?: boolean;
}

export function BotForm({
  initialData,
  onSubmit,
  isLoading = false,
}: BotFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [botType, setBotType] = useState(
    initialData?.configuration?.updateMethod || "WEBHOOK"
  );

  const form = useForm<Bot>({
    resolver: zodResolver(botFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      apiToken: initialData?.apiToken || "",
      configuration: {
        updateMethod: initialData?.configuration?.updateMethod || "WEBHOOK",
        webhookUrl: initialData?.configuration?.webhookUrl || "",
        pollingInterval: initialData?.configuration?.pollingInterval || 30,
      },
      description: initialData?.description || "",
    },
  });

  const handleSubmit = async (data: Bot) => {
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bot Name</FormLabel>
              <FormControl>
                <Input placeholder="My Telegram Bot" {...field} />
              </FormControl>
              <FormDescription>The display name for your bot</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bot Token</FormLabel>
              <FormControl>
                <Input
                  placeholder="1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The token provided by BotFather when you created your bot
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Configuration Section */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Configuration</h3>

          {/* Bot Type */}
          <FormField
            control={form.control}
            name="configuration.updateMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bot Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    setBotType(value as "WEBHOOK" | "LONG_POLLING");
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bot type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="WEBHOOK">Webhook</SelectItem>
                    <SelectItem value="LONG_POLLING">Long Polling</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How the bot will receive updates from Telegram
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Webhook URL (Conditional) */}
          {botType === "WEBHOOK" && (
            <FormField
              control={form.control}
              name="configuration.webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/webhook"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL where Telegram will send updates for this bot
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Polling Interval (Conditional) */}
          {botType === "LONG_POLLING" && (
            <FormField
              control={form.control}
              name="configuration.pollingInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Polling Interval (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={5}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    How often the bot should check for updates (minimum 5
                    seconds)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Max Connections */}
          <FormField
            control={form.control}
            name="configuration.maxConnections"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Connections</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="Enter max connections (1-100)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Maximum number of simultaneous connections for the bot (1-100)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Allowed Updates */}
          <FormField
            control={form.control}
            name="configuration.allowedUpdates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allowed Updates</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter allowed updates (comma-separated)"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Specify the types of updates you want to receive (e.g.,
                  message, edited_message, channel_post)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of what this bot does"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? "Saving..." : "Save Bot"}
        </Button>
      </form>
    </Form>
  );
}
