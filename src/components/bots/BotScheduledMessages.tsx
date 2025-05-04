
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ScheduledMessage {
  id: number;
  botId: number;
  chatId: string;
  messageText: string;
  isRecurring: boolean;
  recurrencePattern: string;
  isSent: boolean;
  scheduledTime: string;
  sentAt: string;
  isCancelled: boolean;
  createdAt: string;
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
                      <div className="max-w-xs truncate">{message.messageText?.length > 10 ? message.messageText.slice(0, 10) + '…' : message.messageText}</div>
                    </TableCell>
                    <TableCell>{new Date(message.scheduledTime).toLocaleString()}</TableCell>
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
