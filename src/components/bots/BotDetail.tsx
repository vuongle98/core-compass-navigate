
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Square,
  X,
  Calendar,
  Edit,
  RefreshCw,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { BotInfo } from "./BotInfo";
import { BotStatus, BotStatusData } from "./BotStatus";
import { BotScheduledMessages } from "./BotScheduledMessages";
import { Bot } from "@/pages/Bots";
import EnhancedApiService from "@/services/EnhancedApiService";

interface BotDetailProps {
  bot: Bot;
  onRefresh: () => void;
}

export function BotDetail({ bot, onRefresh }: BotDetailProps) {
  const [activeTab, setActiveTab] = useState("info");
  const navigate = useNavigate();

  const handleBotAction = async (action: string) => {
    try {
      await EnhancedApiService.post(`/api/v1/bots/${bot.id}/${action}`, {});
      toast.success(`Bot ${action} action completed`);
      onRefresh();
    } catch (error) {
      toast.error(`Failed to ${action} bot`);
      console.error(error);
    }
  };

  const {
    data: scheduledMessages,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["botScheduledMessages", bot.id],
    queryFn: async () => {
      try {
        const response = await EnhancedApiService.get<ScheduledMessage[]>(
          `/api/v1/bots/${bot.id}/scheduled-messages`
        );
        return response || [];
      } catch (error) {
        console.error("Failed to fetch scheduled messages:", error);
        return [];
      }
    }
  });


  const {
    isLoading: isLoadingRefresh,
    refetch: refetchRefresh,
  } = useQuery({
    queryKey: ["fetchRefresh", bot.id],
    queryFn: async () => {
      try {
        const response = await EnhancedApiService.post(
          `/api/v1/bots/${bot.id}/refresh`,
          {}
        );
        return response;
      } catch (error) {
        console.error("Failed to fetch refresh:", error);
        return null;
      }
    }
  });

  const {
    data: botStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["botStatus", bot.id],
    queryFn: async () => {
      try {
        const response = await EnhancedApiService.get<BotStatusData[]>(`/api/v1/bots/${bot.id}/history`);
        return response || [];
      } catch (error) {
        console.error("Failed to fetch bot status:", error);
        return [];
      }
    }
  });

  const refreshData = () => {
    refetchMessages();
    refetchStatus();
    // refetchRefresh();
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
          <TabsTrigger value="status">History Status</TabsTrigger>
          <TabsTrigger value="messages">
            {/* disabled={!bot.scheduled}> */}
            Scheduled Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <BotInfo bot={bot} />
        </TabsContent>

        <TabsContent value="status">
          <div className="max-h-80 overflow-y-auto space-y-4">
            {botStatus && (
              botStatus.map((status) => (
                <BotStatus
                  key={status.id}
                  botStatus={status}
                  bot={bot}
                  isLoading={isLoadingStatus}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="max-h-80 overflow-y-auto space-y-4">
            <BotScheduledMessages
              messages={scheduledMessages}
              isLoading={isLoadingMessages}
              botId={bot.id}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-3">
        {(bot.status === "STOPPED" || bot.status === "CREATED" || bot.status === "ERRORED") && (
          <Button onClick={() => handleBotAction("start")}>
            <Play className="mr-2 h-4 w-4" />
            Start Bot
          </Button>
        )}

        {bot.status === "RUNNING" && (
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

        <Button
          variant="outline"
          onClick={() => navigate(`/bots/${bot.id}/edit`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Bot
        </Button>
      </div>
    </div>
  );
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
