
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { BotForm } from "@/components/bots/BotForm";
import { ArrowLeft } from "lucide-react";
import ApiService from "@/services/ApiService";

interface Bot {
  id: number;
  name: string;
  token: string;
  webhook_url: string;
  status: "active" | "inactive" | "error";
  created_at: string;
  updated_at: string;
  description?: string;
}

const BotEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch bot data
  const { 
    data: bot, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ["bot", id],
    queryFn: async () => {
      if (!id) throw new Error("Bot ID is required");
      const response = await ApiService.get<Bot>(`/api/bots/${id}`);
      return response.data;
    }
  });

  // Handle update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Bot>) => {
      if (!id) throw new Error("Bot ID is required");
      return ApiService.put(`/api/bots/${id}`, data);
    },
    onSuccess: () => {
      toast.success("Bot updated successfully");
      navigate("/bots");
    },
    onError: (error) => {
      toast.error("Failed to update bot");
      console.error("Error updating bot:", error);
    }
  });

  const handleSubmit = async (data: Partial<Bot>) => {
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync(data);
    } finally {
      setIsSaving(false);
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
          title="Edit Bot" 
          description="Update your Telegram bot configuration"
          actions={
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
          ) : bot ? (
            <BotForm 
              initialData={bot} 
              onSubmit={handleSubmit}
              isLoading={isSaving}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default BotEdit;
