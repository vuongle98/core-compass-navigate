
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

// Define the form schema
const botFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  token: z.string().min(10, "Please enter a valid Telegram bot token"),
  webhook_url: z.string().url("Please enter a valid URL"),
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
  
  const form = useForm<BotFormValues>({
    resolver: zodResolver(botFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      token: initialData?.token || "",
      webhook_url: initialData?.webhook_url || "",
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
