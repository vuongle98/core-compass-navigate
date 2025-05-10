import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DataFilters } from "@/components/common/DataFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Archive, Download, Play, Square } from "lucide-react";
import { ActionType, ActionsMenu } from "@/components/common/ActionsMenu";
import { Badge } from "@/components/ui/badge";
import { DetailViewModal } from "@/components/ui/detail-view-modal";
import { useDetailView } from "@/hooks/use-detail-view";
import { BotDetail } from "@/components/bots/BotDetail";
import { BotForm } from "@/components/bots/BotForm";
import { BotStatsCards } from "@/components/bots/BotStatsCards";
import { BotBulkActions } from "@/components/bots/BotBulkActions";
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import { Bot } from "@/types/Bot";
import { Column, FilterOption } from "@/types/Common";
import BotService from "@/services/BotService";

const mockBots: Bot[] = [
  {
    id: 1,
    name: "Support Bot",
    apiToken: "1234567890:ABCDEF1234567890ABCDEF",
    configuration: {
      webhookUrl: "https://example.com/webhook/bot1",
    },
    status: "RUNNING",
    description: "Customer support bot with auto-responses",
  },
  {
    id: 2,
    name: "Marketing Bot",
    apiToken: "0987654321:FEDCBA0987654321FEDCBA",
    description: "Automated marketing campaigns and promotions",
    status: "STOPPED",
  },
  {
    id: 3,
    name: "Analytics Bot",
    apiToken: "5432167890:BDFACE5432167890BDFACE",
    configuration: {
      pollingInterval: 5,
      updateMethod: "LONG_POLLING",
      webhookUrl: "https://example.com/webhook/bot3",
    },
    status: "RUNNING",
    description: "Collects and reports analytics data",
  },
  {
    id: 4,
    name: "Notifications Bot",
    apiToken: "6789054321:ACEFBD6789054321ACEFBD",
    status: "RUNNING",
    description: "Sends notifications and alerts to users",
    configuration: {
      webhookUrl: "https://example.com/webhook/bot4",
      allowedUpdates: ["message", "callback_query"],
      maxConnections: 10,
      dropPendingUpdates: true,
      updateMethod: "WEBHOOK",
    },
  },
  {
    id: 5,
    name: "Test Bot",
    apiToken: "1357924680:FDBECA1357924680FDBECA",
    configuration: {
      webhookUrl: "https://example.com/webhook/bot5",
    },
    status: "RUNNING",
    description: "Development and testing purposes only",
  },
];

const Bots = () => {
  const navigate = useNavigate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {
    isModalOpen,
    selectedItem: selectedBot,
    openDetail,
    closeModal,
  } = useDetailView<Bot>({ modalThreshold: 15, detailRoute: "/detail-bot" });
  const [selectedBots, setSelectedBots] = useState<number[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: botsData,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    refresh,
    isError,
    error,
  } = useApiQuery<Bot>({
    endpoint: "/api/v1/bots",
    queryKey: ["bots", debouncedSearchTerm],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: (err) => {
      console.error("Failed to fetch bots:", err);
      toast.error("Failed to load bots, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
    mockData: {
      content: mockBots,
      totalElements: mockBots.length,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  });

  const handleCreateBot = async (
    data: Omit<Bot, "id" | "created_at" | "updated_at" | "status">
  ) => {
    try {
      await BotService.createBot(data);

      toast.success("Bot created successfully");
      setIsCreateModalOpen(false);
      refresh();
    } catch (error) {
      toast.error("Failed to create bot");
      console.error(error);
    }
  };

  const handleBotAction = async (botId: number, action: string) => {
    await BotService.handleBotAction(botId, action)
      .catch((error) => {
        console.error("Failed to perform bot action:", error);
        toast.error(`Failed to ${action} bot`);
      })
      .finally(() => {
        refresh();
      });
  };

  const handleBulkAction = async (action: string) => {
    if (selectedBots.length === 0) {
      toast.error("No bots selected");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success(`${action} completed for ${selectedBots.length} bots`);
      setSelectedBots([]);
      refresh();
    } catch (error) {
      toast.error(`Failed to ${action} bots`);
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      active: { variant: "default", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      error: { variant: "destructive", label: "Error" },
    };

    const { variant, label } = variants[status] || {
      variant: "outline",
      label: status,
    };

    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      WEBHOOK: { variant: "outline", label: "Webhook" },
      LONG_POLLING: { variant: "outline", label: "Long Polling" },
    };

    const { variant, label } = variants[type] || {
      variant: "outline",
      label: type,
    };

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
      },
    ];

    if (bot.status === "STOPPED") {
      actions.push({
        type: "play" as ActionType,
        label: "Start Bot",
        onClick: () => handleBotAction(bot.id, "start"),
      });
    }

    if (bot.status === "RUNNING") {
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

  const handleSelectItem = (id: number | string, selected: boolean) => {
    setSelectedBots((prev) => {
      if (selected) {
        return [...prev, id as number];
      } else {
        return prev.filter((itemId) => itemId !== id);
      }
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = botsData.map((bot) => bot.id) || [];
      setSelectedBots(allIds);
    } else {
      setSelectedBots([]);
    }
  };

  const columns: Column<Bot>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: Bot) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
      sortable: true,
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (item: Bot) => <div className="font-medium">{item.name}</div>,
      sortable: true,
      filterable: true,
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (item: Bot) => getTypeBadge(item.configuration?.updateMethod || ""),
      sortable: true,
      filterable: true,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: Bot) => getStatusBadge(item.status),
      sortable: true,
      filterable: true,
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      sortable: true,
    },
    {
      header: "Actions",
      id: "actions",
      accessorKey: "actions",
      cell: (item: Bot) => <ActionsMenu actions={getActionItems(item)} />,
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "RUNNING", label: "Running" },
        { value: "STOPPED", label: "Stopped" },
        { value: "ERRORED", label: "Error" },
      ],
    },
    {
      id: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "WEBHOOK", label: "Webhook" },
        { value: "LONG_POLLING", label: "Long Polling" },
      ],
    },
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search bots...",
    },
  ];

  const ButtonSkeleton = () => {
    return <Skeleton className="h-10 w-24" />;
  };

  const getActiveBotsCount = () =>
    botsData?.filter((bot) => bot.status === "RUNNING").length || 0;

  const bulkActions = [
    {
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      action: () => handleBulkAction("delete"),
    },
    {
      label: "Archive Selected",
      icon: <Archive className="h-4 w-4" />,
      action: () => handleBulkAction("archive"),
    },
    {
      label: "Start Selected",
      icon: <Play className="h-4 w-4" />,
      action: () => handleBulkAction("start"),
    },
    {
      label: "Stop Selected",
      icon: <Square className="h-4 w-4" />,
      action: () => handleBulkAction("stop"),
    },
    {
      label: "Export Selected",
      icon: <Download className="h-4 w-4" />,
      action: () => handleBulkAction("export"),
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
              {selectedBots.length > 0 && (
                <BotBulkActions
                  selectedCount={selectedBots.length}
                  actions={bulkActions}
                />
              )}
            </div>
          }
        />

        <BotStatsCards
          totalBots={botsData?.length || 0}
          activeBots={getActiveBotsCount()}
        />

        <div className="mt-4">
          <DataFilters
            className="mb-4"
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            options={filterOptions}
            onChange={(newFilters) => {
              setFilters(newFilters);
              // Update the search term when filters change
              if (newFilters.search !== undefined) {
                setSearchTerm(newFilters.search.toString());
              }
            }}
            onReset={() => {
              resetFilters();
              setSearchTerm("");
              refresh();
            }}
          />

          <DataTable
            data={botsData || []}
            columns={columns}
            title="Telegram Bots"
            pagination={true}
            initialPageSize={pagination.pageSize}
            pageSizeOptions={[5, 10, 25, 50]}
            isLoading={isLoading}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            totalItems={totalItems}
            showAddButton={true}
            onAddClick={() => setIsCreateModalOpen(true)}
          />
        </div>

        <DetailViewModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedBot?.name || "Bot Details"}
          size="full"
          showCloseButton={false}
        >
          {selectedBot && <BotDetail bot={selectedBot} onRefresh={refresh} />}
        </DetailViewModal>

        <DetailViewModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Bot"
          size="lg"
          showCloseButton={false}
        >
          <BotForm onSubmit={handleCreateBot} />
        </DetailViewModal>
      </main>
    </div>
  );
};

export default Bots;
