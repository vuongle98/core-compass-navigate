import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PlusCircle, 
  Bot, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Trash2,
  Archive,
  Download,
  UploadCloud,
  MoreHorizontal,
  Play,
  Square,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionType, ActionsMenu } from "@/components/common/ActionsMenu";
import { Badge } from "@/components/ui/badge";
import { DetailViewModal } from "@/components/ui/detail-view-modal";
import { useDetailView } from "@/hooks/use-detail-view";
import { BotDetail } from "@/components/bots/BotDetail";
import { BotForm } from "@/components/bots/BotForm";
import { BotStatsCards } from "@/components/bots/BotStatsCards";
import { BotBulkActions } from "@/components/bots/BotBulkActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ApiService from "@/services/ApiService";

export interface Bot {
  id: number;
  name: string;
  token: string;
  webhook_url?: string;
  status: "active" | "inactive" | "error";
  created_at: string;
  updated_at: string;
  scheduled?: boolean;
  description?: string;
  users_count?: number;
  messages_count?: number;
  platform?: string;
  type: "WEBHOOK" | "LONG_POLLING";
  polling_interval?: number;
}

interface Column {
  header: string;
  accessorKey: string;
  id?: string;
  cell?: (item: Bot) => JSX.Element;
  sortable?: boolean;
  filterable?: boolean;
}

const mockBots: Bot[] = [
  {
    id: 1,
    name: "Support Bot",
    token: "1234567890:ABCDEF1234567890ABCDEF",
    webhook_url: "https://example.com/webhook/bot1",
    status: "active",
    created_at: "2025-03-15",
    updated_at: "2025-04-12",
    scheduled: true,
    description: "Customer support bot with auto-responses",
    users_count: 1542,
    messages_count: 27835,
    platform: "Telegram",
    type: "WEBHOOK"
  },
  {
    id: 2,
    name: "Marketing Bot",
    token: "0987654321:FEDCBA0987654321FEDCBA",
    status: "inactive",
    created_at: "2025-03-20",
    updated_at: "2025-04-08",
    scheduled: false,
    description: "Automated marketing campaigns and promotions",
    users_count: 856,
    messages_count: 12405,
    platform: "Telegram",
    type: "LONG_POLLING"
  },
  {
    id: 3,
    name: "Analytics Bot",
    token: "5432167890:BDFACE5432167890BDFACE",
    webhook_url: "https://example.com/webhook/bot3",
    status: "error",
    created_at: "2025-04-01",
    updated_at: "2025-04-15",
    scheduled: false,
    description: "Collects and reports analytics data",
    users_count: 243,
    messages_count: 4129,
    platform: "Telegram",
    type: "WEBHOOK"
  },
  {
    id: 4,
    name: "Notifications Bot",
    token: "6789054321:ACEFBD6789054321ACEFBD",
    status: "active",
    created_at: "2025-04-05",
    updated_at: "2025-04-14",
    scheduled: true,
    description: "Sends notifications and alerts to users",
    users_count: 1021,
    messages_count: 18762,
    platform: "Telegram",
    type: "LONG_POLLING"
  },
  {
    id: 5,
    name: "Test Bot",
    token: "1357924680:FDBECA1357924680FDBECA",
    webhook_url: "https://example.com/webhook/bot5",
    status: "inactive",
    created_at: "2025-04-08",
    updated_at: "2025-04-10",
    scheduled: false,
    description: "Development and testing purposes only",
    users_count: 12,
    messages_count: 567,
    platform: "Telegram",
    type: "WEBHOOK"
  }
];

const Bots = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    search: "",
  });
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isModalOpen, selectedItem: selectedBot, openDetail, closeModal } = useDetailView<Bot>();
  const [selectedBots, setSelectedBots] = useState<number[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  });
  
  const {
    data: botsData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["bots", filters, pagination.pageIndex, pagination.pageSize],
    queryFn: async () => {
      try {
        const response = await ApiService.get<any>(`/api/bots?page=${pagination.pageIndex}&size=${pagination.pageSize}&status=${filters.status}&type=${filters.type}&search=${filters.search}`);
        return response.data;
      } catch (error) {
        console.log("Failed to fetch from API, using mock data:", error);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log("Fetching bots with params:", {
          filters,
          page: pagination.pageIndex,
          size: pagination.pageSize
        });
        
        let filteredBots = [...mockBots];
        
        if (filters.status) {
          filteredBots = filteredBots.filter(bot => bot.status === filters.status);
        }
        
        if (filters.type) {
          filteredBots = filteredBots.filter(bot => bot.type === filters.type);
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredBots = filteredBots.filter(bot => 
            bot.name.toLowerCase().includes(searchLower) || 
            bot.description?.toLowerCase().includes(searchLower)
          );
        }
        
        return {
          content: filteredBots.slice(
            pagination.pageIndex * pagination.pageSize, 
            (pagination.pageIndex + 1) * pagination.pageSize
          ),
          totalElements: filteredBots.length,
          totalPages: Math.ceil(filteredBots.length / pagination.pageSize),
          number: pagination.pageIndex,
          size: pagination.pageSize
        };
      }
    }
  });

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
    setPagination(prev => ({
      ...prev,
      pageIndex: 0
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      type: "",
      search: "",
    });
  };

  const handleCreateBot = async (data: Omit<Bot, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
      await ApiService.post(`/api/bots/${botId}/${action}`, {}).catch(() => {
        return new Promise(resolve => setTimeout(resolve, 500));
      });
      
      toast.success(`Bot ${action} action completed`);
      refetch();
    } catch (error) {
      toast.error(`Failed to ${action} bot`);
      console.error(error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedBots.length === 0) {
      toast.error("No bots selected");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      toast.success(`${action} completed for ${selectedBots.length} bots`);
      setSelectedBots([]);
      refetch();
    } catch (error) {
      toast.error(`Failed to ${action} bots`);
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

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      WEBHOOK: { variant: "outline", label: "Webhook" },
      LONG_POLLING: { variant: "outline", label: "Long Polling" },
    };
    
    const { variant, label } = variants[type] || { variant: "outline", label: type };
    
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
          handleBotAction(bot.id, "delete");
        }
      },
    });

    return actions;
  };

  const handlePageChange = (pageIndex: number) => {
    setPagination(prev => ({
      ...prev,
      pageIndex
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination({
      pageIndex: 0,
      pageSize
    });
  };

  const handleSelectItem = (id: number | string, selected: boolean) => {
    setSelectedBots(prev => {
      if (selected) {
        return [...prev, id as number];
      } else {
        return prev.filter(itemId => itemId !== id);
      }
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = botsData?.content.map(bot => bot.id) || [];
      setSelectedBots(allIds);
    } else {
      setSelectedBots([]);
    }
  };

  const columns: Column[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: Bot) => <span className="text-muted-foreground">{item.id}</span>,
      sortable: true
    },
    { 
      header: "Name", 
      accessorKey: "name",
      cell: (item: Bot) => <div className="font-medium">{item.name}</div>,
      sortable: true,
      filterable: true
    },
    { 
      header: "Type", 
      accessorKey: "type",
      cell: (item: Bot) => getTypeBadge(item.type),
      sortable: true,
      filterable: true
    },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (item: Bot) => getStatusBadge(item.status),
      sortable: true,
      filterable: true
    },
    { 
      header: "Users", 
      accessorKey: "users_count",
      cell: (item: Bot) => (
        <div className="font-medium">{item.users_count?.toLocaleString()}</div>
      ),
      sortable: true
    },
    { 
      header: "Messages", 
      accessorKey: "messages_count",
      cell: (item: Bot) => (
        <div className="font-medium">{item.messages_count?.toLocaleString()}</div>
      ),
      sortable: true
    },
    { 
      header: "Created At", 
      accessorKey: "created_at",
      sortable: true
    },
    {
      header: "Actions",
      id: "actions",
      accessorKey: "id",
      cell: (item: Bot) => (
        <ActionsMenu actions={getActionItems(item)} />
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
      id: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "WEBHOOK", label: "Webhook" },
        { value: "LONG_POLLING", label: "Long Polling" }
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

  const getActiveBotsCount = () => botsData?.content.filter(bot => bot.status === "active").length || 0;
  const getTotalMessagesCount = () => botsData?.content.reduce((sum, bot) => sum + (bot.messages_count || 0), 0) || 0;
  const getTotalUsersCount = () => botsData?.content.reduce((sum, bot) => sum + (bot.users_count || 0), 0) || 0;

  const bulkActions = [
    {
      label: 'Delete Selected',
      icon: <Trash2 className="h-4 w-4" />,
      action: () => handleBulkAction('delete')
    },
    {
      label: 'Archive Selected',
      icon: <Archive className="h-4 w-4" />,
      action: () => handleBulkAction('archive')
    },
    {
      label: 'Start Selected',
      icon: <Play className="h-4 w-4" />,
      action: () => handleBulkAction('start')
    },
    {
      label: 'Stop Selected',
      icon: <Square className="h-4 w-4" />,
      action: () => handleBulkAction('stop')
    },
    {
      label: 'Export Selected',
      icon: <Download className="h-4 w-4" />,
      action: () => handleBulkAction('export')
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Telegram Bots" 
          description="Manage your Telegram bots"
          actions={
            <div className="flex space-x-2">
              {selectedBots.length > 0 ? (
                <BotBulkActions 
                  selectedCount={selectedBots.length} 
                  actions={bulkActions}
                />
              ) : (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Bot
                </Button>
              )}
            </div>
          }
        />
        
        <BotStatsCards 
          totalBots={botsData?.totalElements || 0}
          activeBots={getActiveBotsCount()}
          totalUsers={getTotalUsersCount()}
          totalMessages={getTotalMessagesCount()}
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
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              Failed to load bots. Please try again.
            </div>
          ) : (
            <DataTable 
              data={botsData?.content || []} 
              columns={columns} 
              title="Telegram Bots"
              pagination={true}
              selectedItems={selectedBots}
              onSelectItems={handleSelectItem}
              onSelectAll={handleSelectAll}
              initialPageSize={pagination.pageSize}
              pageSizeOptions={[5, 10, 25, 50]}
              showAddButton={false}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
        
        <DetailViewModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedBot?.name || "Bot Details"}
          size="lg"
        >
          {selectedBot && <BotDetail bot={selectedBot} onRefresh={refetch} />}
        </DetailViewModal>
        
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
