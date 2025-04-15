
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionType, ActionsMenu } from "@/components/common/ActionsMenu";
import { Badge } from "@/components/ui/badge";
import { DetailViewModal } from "@/components/ui/detail-view-modal";
import { useDetailView } from "@/hooks/use-detail-view";
import { BotDetail } from "@/components/bots/BotDetail";
import ApiService from "@/services/ApiService";
import { BotForm } from "@/components/bots/BotForm";

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

// Define column type to match DataTable expectations
interface Column {
  header: string;
  accessorKey: string;
  id?: string;
  cell?: ({row}: any) => JSX.Element;
}

const Bots = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isModalOpen, selectedItem: selectedBot, openDetail, closeModal } = useDetailView<Bot>();
  
  const {
    data: bots,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["bots", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      
      const response = await ApiService.get<Bot[]>("/api/bots", params);
      return response.data || [];
    }
  });

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      search: "",
    });
  };

  const handleCreateBot = async (data: Omit<Bot, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      await ApiService.post("/api/bots", data, {});
      toast.success("Bot created successfully");
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to create bot");
      console.error(error);
    }
  };

  const handleBotAction = async (botId: number, action: string) => {
    try {
      await ApiService.post(`/api/bots/${botId}/${action}`, {});
      toast.success(`Bot ${action} action completed`);
      refetch();
    } catch (error) {
      toast.error(`Failed to ${action} bot`);
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { variant: "default", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      error: { variant: "destructive", label: "Error" },
    };
    
    const { variant, label } = variants[status] || { variant: "outline", label: status };
    
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getActionItems = (bot: Bot) => {
    const actions = [
      {
        type: "view" as ActionType,
        label: "View Details",
        onClick: () => openDetail(bot),
      },
      {
        type: "edit" as ActionType,
        label: "Edit",
        onClick: () => navigate(`/bots/${bot.id}/edit`),
      }
    ];

    // Add conditional actions based on bot status
    if (bot.status === "inactive") {
      actions.push({
        type: "play" as ActionType,
        label: "Start Bot",
        onClick: () => handleBotAction(bot.id, "start"),
      });
    }

    if (bot.status === "active") {
      actions.push({
        type: "square" as ActionType,
        label: "Stop Bot",
        onClick: () => handleBotAction(bot.id, "stop"),
      });
    }

    if (!bot.scheduled) {
      actions.push({
        type: "calendar-clock" as ActionType, 
        label: "Schedule",
        onClick: () => navigate(`/bots/${bot.id}/schedule`),
      });
    } else {
      actions.push({
        type: "x" as ActionType,
        label: "Cancel Schedule",
        onClick: () => handleBotAction(bot.id, "cancel"),
      });
    }

    actions.push({
      type: "trash" as ActionType,
      label: "Delete",
      onClick: () => {
        if (confirm("Are you sure you want to delete this bot?")) {
          // Implementation for delete operation would go here
          console.log("Delete bot:", bot.id);
        }
      },
    });

    return actions;
  };

  const columns: Column[] = [
    { 
      header: "Name", 
      accessorKey: "name",
      cell: ({ row }: any) => <div className="font-medium">{row.original.name}</div>
    },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: ({ row }: any) => getStatusBadge(row.original.status)
    },
    { 
      header: "Created At", 
      accessorKey: "created_at" 
    },
    {
      header: "Actions",
      id: "actions",
      accessorKey: "id",
      cell: ({ row }: any) => (
        <ActionsMenu actions={getActionItems(row.original)} />
      ),
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "error", label: "Error" }
      ]
    },
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search bots..."
    }
  ];

  const ButtonSkeleton = () => {
    return <Skeleton className="h-10 w-24" />;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Telegram Bots" 
          description="Manage your Telegram bots"
          actions={
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Bot
            </Button>
          }
        />
        
        <div className="mt-6">
          <DataFilters 
            filters={filters}
            options={filterOptions}
            onChange={handleFilterChange}
            onReset={resetFilters}
          />
          
          {isLoading ? (
            <div className="space-y-3 mt-6">
              <ButtonSkeleton />
              <ButtonSkeleton />
              <ButtonSkeleton />
            </div>
          ) : isError ? (
            <div className="text-center p-4 text-destructive">
              Failed to load bots. Please try again.
            </div>
          ) : (
            <DataTable 
              data={bots || []} 
              columns={columns} 
              title="Telegram Bots" 
              pagination={true}
              initialPageSize={10}
            />
          )}
        </div>
        
        {/* Bot Detail Modal */}
        <DetailViewModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedBot?.name || "Bot Details"}
          size="lg"
        >
          {selectedBot && <BotDetail bot={selectedBot} onRefresh={refetch} />}
        </DetailViewModal>
        
        {/* Create Bot Modal */}
        <DetailViewModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Bot"
          size="lg"
        >
          <BotForm onSubmit={handleCreateBot} />
        </DetailViewModal>
      </main>
    </div>
  );
};

export default Bots;
