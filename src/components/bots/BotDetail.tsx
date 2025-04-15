
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Play, Square, CalendarClock, X } from "lucide-react";
import { toast } from "sonner";
import ApiService from "@/services/ApiService";
import { BotScheduleForm } from "./BotScheduleForm";

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
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      await ApiService.post(`/api/bots/${bot.id}/${action}`);
      toast.success(`Bot ${action} action completed`);
      onRefresh();
    } catch (error) {
      toast.error(`Failed to ${action} bot`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule = async (scheduleData: any) => {
    setIsLoading(true);
    try {
      await ApiService.post(`/api/bots/${bot.id}/schedule`, scheduleData);
      toast.success("Bot scheduled successfully");
      setIsScheduling(false);
      onRefresh();
    } catch (error) {
      toast.error("Failed to schedule bot");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { variant: "success", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      error: { variant: "destructive", label: "Error" },
    };
    
    const { variant, label } = variants[status] || { variant: "outline", label: status };
    
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Render the scheduling form if the user is scheduling
  if (isScheduling) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setIsScheduling(false)}>
          Back to Details
        </Button>
        <BotScheduleForm onSubmit={handleSchedule} isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle>Bot Information</CardTitle>
            {getStatusBadge(bot.status)}
          </div>
          <CardDescription>
            Basic information about this Telegram bot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
              <p>{bot.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
              <p>{new Date(bot.created_at).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <h4 className="text-sm font-medium text-muted-foreground">Webhook URL</h4>
              <p className="break-all">{bot.webhook_url}</p>
            </div>
            {bot.description && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p>{bot.description}</p>
              </div>
            )}
            <div className="col-span-2">
              <h4 className="text-sm font-medium text-muted-foreground">Schedule Status</h4>
              <p>{bot.scheduled ? "Scheduled tasks active" : "No active schedule"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-wrap gap-4">
        {bot.status === "inactive" ? (
          <Button
            onClick={() => handleAction("start")}
            disabled={isLoading}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Bot
          </Button>
        ) : (
          <Button
            onClick={() => handleAction("stop")}
            disabled={isLoading}
            variant="outline"
          >
            <Square className="mr-2 h-4 w-4" />
            Stop Bot
          </Button>
        )}
        
        {!bot.scheduled ? (
          <Button
            onClick={() => setIsScheduling(true)}
            disabled={isLoading}
            variant="outline"
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            Schedule Tasks
          </Button>
        ) : (
          <Button
            onClick={() => handleAction("cancel")}
            disabled={isLoading}
            variant="outline"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel Schedule
          </Button>
        )}
      </div>
    </div>
  );
}
