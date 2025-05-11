import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { BotScheduleForm } from "@/components/bots/BotScheduleForm";
import { ArrowLeft } from "lucide-react";
import { Bot, BotScheduledMessage } from "@/types/Bot";
import BotService from "@/services/BotService";
import useApiData from "@/hooks/use-api-data";

const BotSchedule = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: bot,
    isLoading,
    isError,
    error,
  } = useApiData<Bot>({
    queryKey: ["bot-basic", id],
    endpoint: `/api/v1/bots/${id}`,
    onError: (error) => {
      toast.error("Failed to load bot data");
      console.error("Error fetching bot:", error);
    },
  });

  const handleSubmit = async (scheduleData: BotScheduledMessage) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await BotService.scheduleMessage(id, scheduleData);
      toast.success("Bot scheduled successfully");
      navigate(`/bots`);
    } catch (err) {
      toast.error("Failed to schedule bot");
      console.error("Error scheduling bot:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show error if fetching failed
  useEffect(() => {
    if (isError) {
      toast.error("Failed to load bot data");
      console.error("Error fetching bot:", error);
    }
  }, [isError, error]);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <PageHeader
        title={`Schedule Bot${bot ? `: ${bot.name}` : ""}`}
        description="Schedule automated tasks for your Telegram bot"
        actions={
          <Button variant="outline" onClick={() => navigate("/bots")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bots
          </Button>
        }
      />

      <div className="mt-4 max-w-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading bot data...</p>
          </div>
        ) : isError ? (
          <div className="text-center p-4 text-destructive">
            Failed to load bot data. Please try again.
          </div>
        ) : (
          <BotScheduleForm
            botInfo={bot}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default BotSchedule;
