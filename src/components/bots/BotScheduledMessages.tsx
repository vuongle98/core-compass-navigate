
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ScheduledMessage {
  id: number;
  bot_id: number;
  message: string;
  schedule_time: string;
  status: "pending" | "sent" | "failed";
  recipient: string;
  created_at: string;
}

interface BotScheduledMessagesProps {
  messages?: ScheduledMessage[];
  isLoading: boolean;
  botId: number;
}

export function BotScheduledMessages({ messages, isLoading, botId }: BotScheduledMessagesProps) {
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>{message.id}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{message.message}</div>
                    </TableCell>
                    <TableCell>{message.recipient}</TableCell>
                    <TableCell>{new Date(message.schedule_time).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          message.status === "sent"
                            ? "default"
                            : message.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                      </Badge>
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
