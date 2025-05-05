import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, BotHistory } from "@/types/Bot";

interface BotStatusProps {
  botStatus: BotHistory | null;
  bot: Bot;
  isLoading: boolean;
}

export function BotStatus({ botStatus, bot, isLoading }: BotStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Runtime Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : botStatus ? (
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Current Status
              </dt>
              <dd className="mt-1">
                <Badge
                  variant={
                    botStatus.newStatus === "RUNNING" ? "default" : "secondary"
                  }
                >
                  {botStatus.newStatus}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Previous Status
              </dt>
              <dd className="mt-1 text-sm">
                {botStatus.previousStatus || "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Timestamp
              </dt>
              <dd className="mt-1 text-sm">{botStatus.timestamp || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Notes
              </dt>
              <dd className="mt-1 text-sm">{botStatus.notes || "N/A"}</dd>
            </div>
            {/* {bot.type === "LONG_POLLING" && bot.last_polling_time && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Polling Time</dt>
                <dd className="mt-1 text-sm">{new Date(bot.last_polling_time).toLocaleString()}</dd>
              </div>
            )} */}
          </dl>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No status information available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
