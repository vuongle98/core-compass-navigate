
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Square, X } from "lucide-react";
import { toast } from "sonner";
import ApiService from "@/services/ApiService";

interface Bot {
  id: number;
  name: string;
  token: string;
  webhook_url: string;
  status: "active" | "inactive" | "error";
  created_at: string;
  updated_at: string;
  scheduled?: boolean;
  description?: string;
}

interface BotDetailProps {
  bot: Bot;
  onRefresh: () => void;
}

export function BotDetail({ bot, onRefresh }: BotDetailProps) {
  const handleBotAction = async (action: string) => {
    try {
      await ApiService.post(`/api/bots/${bot.id}/${action}`, {});
      toast.success(`Bot ${action} action completed`);
      onRefresh();
    } catch (error) {
      toast.error(`Failed to ${action} bot`);
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="mt-1 text-lg">{bot.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <Badge
                  variant={
                    bot.status === "active"
                      ? "default"
                      : bot.status === "inactive"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Webhook URL</dt>
              <dd className="mt-1 text-sm break-all">{bot.webhook_url}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Token</dt>
              <dd className="mt-1 text-sm">
                <code className="bg-muted px-1 py-0.5 rounded">
                  {bot.token.substring(0, 10)}...
                </code>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
              <dd className="mt-1 text-sm">{new Date(bot.created_at).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Updated At</dt>
              <dd className="mt-1 text-sm">{new Date(bot.updated_at).toLocaleString()}</dd>
            </div>
            {bot.scheduled && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Scheduled</dt>
                <dd className="mt-1 text-sm">This bot has scheduled tasks</dd>
              </div>
            )}
            {bot.description && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="mt-1 text-sm">{bot.description}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-3">
        {bot.status === "inactive" && (
          <Button onClick={() => handleBotAction("start")}>
            <Play className="mr-2 h-4 w-4" />
            Start Bot
          </Button>
        )}
        
        {bot.status === "active" && (
          <Button onClick={() => handleBotAction("stop")}>
            <Square className="mr-2 h-4 w-4" />
            Stop Bot
          </Button>
        )}
        
        {bot.scheduled && (
          <Button variant="outline" onClick={() => handleBotAction("cancel")}>
            <X className="mr-2 h-4 w-4" />
            Cancel Schedule
          </Button>
        )}
      </div>
    </div>
  );
}
