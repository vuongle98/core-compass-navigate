
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Bot {
  id: number;
  name: string;
  token: string;
  webhook_url?: string;
  status: "active" | "inactive" | "error";
  created_at: string;
  updated_at: string;
  scheduled?: boolean;
  description?: string;
  type: "WEBHOOK" | "LONG_POLLING";
  polling_interval?: number;
  last_polling_time?: string;
}

interface BotInfoProps {
  bot: Bot;
}

export function BotInfo({ bot }: BotInfoProps) {
  return (
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
            <dt className="text-sm font-medium text-muted-foreground">Type</dt>
            <dd className="mt-1">
              <Badge variant="outline">{bot.type}</Badge>
            </dd>
          </div>
          {bot.type === "WEBHOOK" && bot.webhook_url && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Webhook URL</dt>
              <dd className="mt-1 text-sm break-all">{bot.webhook_url}</dd>
            </div>
          )}
          {bot.type === "LONG_POLLING" && bot.polling_interval && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Polling Interval</dt>
              <dd className="mt-1 text-sm">{bot.polling_interval} seconds</dd>
            </div>
          )}
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
  );
}
