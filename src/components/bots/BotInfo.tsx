import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot } from "@/types/Bot";

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
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">
              <Badge
                variant={
                  bot.status === "RUNNING"
                    ? "default"
                    : bot.status === "STOPPED"
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
              <Badge variant="outline">{bot.configuration?.updateMethod}</Badge>
            </dd>
          </div>
          {bot.configuration?.updateMethod === "WEBHOOK" &&
            bot.configuration?.webhookUrl && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Webhook URL
                </dt>
                <dd className="mt-1 text-sm break-all">
                  {bot.configuration?.webhookUrl}
                </dd>
              </div>
            )}
          {bot.configuration?.updateMethod === "LONG_POLLING" &&
            bot.configuration.pollingInterval && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Polling Interval
                </dt>
                <dd className="mt-1 text-sm">
                  {bot.configuration.pollingInterval} seconds
                </dd>
              </div>
            )}
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Token</dt>
            <dd className="mt-1 text-sm">
              <code className="bg-muted px-1 py-0.5 rounded">
                {bot.apiToken?.substring(0, 10)}...
              </code>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Created At
            </dt>
            <dd className="mt-1 text-sm">
              {new Date(bot.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Updated At
            </dt>
            <dd className="mt-1 text-sm">
              {new Date(bot.updatedAt).toLocaleString()}
            </dd>
          </div>
          {bot.scheduled && (
            <div className="col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">
                Scheduled
              </dt>
              <dd className="mt-1 text-sm">This bot has scheduled tasks</dd>
            </div>
          )}
          {bot.description && (
            <div className="col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">
                Description
              </dt>
              <dd className="mt-1 text-sm">{bot.description}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
