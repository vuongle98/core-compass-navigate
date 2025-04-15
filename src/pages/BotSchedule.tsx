
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { BotScheduleForm } from "@/components/bots/BotScheduleForm";
import { ArrowLeft } from "lucide-react";
import ApiService from "@/services/ApiService";

interface Bot {
  id: number;
  name: string;
  status: string;
}

const BotSchedule = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch basic bot info to display the name
  const { 
    data: bot, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ["bot-basic", id],
    queryFn: async () => {
      if (!id) throw new Error("Bot ID is required");
      const response = await ApiService.get<Bot>(`/api/bots/${id}`);
      return response.data;
    }
  });

  const handleSubmit = async (scheduleData: any) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await ApiService.post(`/api/bots/${id}/schedule`, scheduleData);
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title={`Schedule Bot${bot ? `: ${bot.name}` : ""}`}
          description="Schedule automated tasks for your Telegram bot"
          button={
            <Button variant="outline" onClick={() => navigate("/bots")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bots
            </Button>
          }
        />
        
        <div className="mt-6 max-w-2xl">
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
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default BotSchedule;
