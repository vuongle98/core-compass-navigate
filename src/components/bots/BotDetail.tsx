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
import ApiService from "@/services/ApiService";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { BotInfo } from "./BotInfo";
import { BotStatus } from "./BotStatus";
import { BotScheduledMessages } from "./BotScheduledMessages";
import { Bot } from "@/pages/Bots";

interface BotDetailProps {
  bot: Bot;
  onRefresh: () => void;
}

export function BotDetail({ bot, onRefresh }: BotDetailProps) {
  const [activeTab, setActiveTab] = useState("info");
  const navigate = useNavigate();

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

  const {
    data: scheduledMessages,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["botScheduledMessages", bot.id],
    queryFn: async () => {
      try {
        const response = await ApiService.get<ScheduledMessage[]>(
          `/api/bots/${bot.id}/scheduled-messages`
        );
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch scheduled messages:", error);
        return [];
      }
    },
    enabled: bot.scheduled === true,
  });

  const {
    data: botStatuses,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useQuery({
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Find the status for this specific bot from the array of statuses
  const botStatus =
    botStatuses && Array.isArray(botStatuses)
      ? botStatuses.find((status: BotStatus) => status.bot_id === bot.id)
      : null;

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
          <TabsTrigger value="messages" disabled={!bot.scheduled}>
            Scheduled Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <BotInfo bot={bot} />
        </TabsContent>

        <TabsContent value="status">
          <BotStatus
            botStatus={botStatus}
            bot={bot}
            isLoading={isLoadingStatus}
          />
        </TabsContent>

        <TabsContent value="messages">
          <BotScheduledMessages
            messages={scheduledMessages}
            isLoading={isLoadingMessages}
            botId={bot.id}
          />
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-3">
        {bot.status === "RUNNING" && (
          <Button onClick={() => handleBotAction("start")}>
            <Play className="mr-2 h-4 w-4" />
            Start Bot
          </Button>
        )}

        {bot.status === "STOPPED" && (
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
  bot_id: number;
  message: string;
  schedule_time: string;
  status: "pending" | "sent" | "failed";
  recipient: string;
  created_at: string;
}
