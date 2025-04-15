
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

// Define the form schema with conditional fields based on bot type
const botFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  token: z.string().min(10, "Please enter a valid Telegram bot token"),
  type: z.enum(["WEBHOOK", "LONG_POLLING"]),
  webhook_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  polling_interval: z.number().min(5).optional(),
  description: z.string().optional(),
});

type BotFormValues = z.infer<typeof botFormSchema>;

interface BotFormProps {
  initialData?: Partial<BotFormValues>;
  onSubmit: (data: BotFormValues) => Promise<void> | void;
  isLoading?: boolean;
}

export function BotForm({ initialData, onSubmit, isLoading = false }: BotFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [botType, setBotType] = useState(initialData?.type || "WEBHOOK");
  
  const form = useForm<BotFormValues>({
    resolver: zodResolver(botFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      token: initialData?.token || "",
      type: initialData?.type || "WEBHOOK",
      webhook_url: initialData?.webhook_url || "",
      polling_interval: initialData?.polling_interval || 30,
      description: initialData?.description || "",
    },
  });

  const handleSubmit = async (data: BotFormValues) => {
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
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bot Token</FormLabel>
              <FormControl>
                <Input placeholder="1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ" {...field} />
              </FormControl>
              <FormDescription>
                The token provided by BotFather when you created your bot
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
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
        
        {botType === "WEBHOOK" && (
          <FormField
            control={form.control}
            name="webhook_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Webhook URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/webhook" {...field} />
                </FormControl>
                <FormDescription>
                  URL where Telegram will send updates for this bot
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {botType === "LONG_POLLING" && (
          <FormField
            control={form.control}
            name="polling_interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Polling Interval (seconds)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={5}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  How often the bot should check for updates (minimum 5 seconds)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
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
