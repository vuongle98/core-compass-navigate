
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Square, X, Calendar, Edit, RefreshCw, Clock } from "lucide-react";
import { toast } from "sonner";
import ApiService from "@/services/ApiService";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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

interface BotStatus {
  bot_id: number;
  is_running: boolean;
  memory_usage?: string;
  cpu_usage?: string;
  uptime?: string;
}

interface ScheduledMessage {
  id: number;
  bot_id: number;
  message: string;
  schedule_time: string;
  status: "pending" | "sent" | "failed";
  recipient: string;
  created_at: string;
}

interface BotDetailProps {
  bot: Bot;
  onRefresh: () => void;
}

export function BotDetail({ bot, onRefresh }: BotDetailProps) {
  const [activeTab, setActiveTab] = useState("info");

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

  const { data: scheduledMessages, isLoading: isLoadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ["botScheduledMessages", bot.id],
    queryFn: async () => {
      try {
        const response = await ApiService.get<ScheduledMessage[]>(`/api/bots/${bot.id}/scheduled-messages`);
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch scheduled messages:", error);
        return [];
      }
    },
    enabled: bot.scheduled === true
  });

  const { data: botStatuses, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["botStatus", bot.id],
    queryFn: async () => {
      try {
        const response = await ApiService.get<BotStatus[]>(`/api/bots/status`);
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch bot status:", error);
        return [];
      }
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });
  
  // Find the status for this specific bot from the array of statuses
  const botStatus = botStatuses ? botStatuses.find((status: BotStatus) => status.bot_id === bot.id) : null;

  const refreshData = () => {
    refetchMessages();
    refetchStatus();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Bot Details</h3>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="messages" disabled={!bot.scheduled}>Scheduled Messages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
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
        </TabsContent>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Runtime Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStatus ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : botStatus ? (
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Current Status</dt>
                    <dd className="mt-1">
                      <Badge variant={botStatus.is_running ? "default" : "secondary"}>
                        {botStatus.is_running ? "Running" : "Stopped"}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Memory Usage</dt>
                    <dd className="mt-1 text-sm">{botStatus.memory_usage || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">CPU Usage</dt>
                    <dd className="mt-1 text-sm">{botStatus.cpu_usage || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Uptime</dt>
                    <dd className="mt-1 text-sm">{botStatus.uptime || "N/A"}</dd>
                  </div>
                  {bot.type === "LONG_POLLING" && bot.last_polling_time && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Last Polling Time</dt>
                      <dd className="mt-1 text-sm">{new Date(bot.last_polling_time).toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No status information available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMessages ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : scheduledMessages && scheduledMessages.length > 0 ? (
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
                      {scheduledMessages.map((message) => (
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
        </TabsContent>
      </Tabs>
      
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
        
        {!bot.scheduled && (
          <Button variant="outline" onClick={() => handleBotAction("schedule")}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Messages
          </Button>
        )}
        
        {bot.scheduled && (
          <Button variant="outline" onClick={() => handleBotAction("cancel")}>
            <X className="mr-2 h-4 w-4" />
            Cancel Schedule
          </Button>
        )}
        
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Bot
        </Button>
      </div>
    </div>
  );
}
