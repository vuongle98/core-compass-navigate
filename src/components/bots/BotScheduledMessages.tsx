import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BotScheduledMessage } from "@/types/Bot";
import { Button } from "../ui/button";
import BotService from "@/services/BotService";

interface BotScheduledMessagesProps {
  messages?: BotScheduledMessage[];
  isLoading: boolean;
  botId: number;
  handleScheduleMessage: (
    botId: number,
    data: Partial<BotScheduledMessage>
  ) => Promise<void> | void;
}

export function BotScheduledMessages({
  messages,
  isLoading,
  botId,
}: BotScheduledMessagesProps) {
  const handleCancel = async (botId: number, messageId: number) => {
    await BotService.cancelScheduledMessage(botId, messageId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Schedule Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>{message.id}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {message.messageText?.length > 10
                          ? message.messageText.slice(0, 10) + "…"
                          : message.messageText}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(message.scheduledTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          message.isSent === true
                            ? "default"
                            : message.isSent === false
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {message.isSent ? "Sent" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          message.isCancelled === true
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {message.isCancelled ? "Cancelled" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!message.isCancelled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(botId, message.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No scheduled messages available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
