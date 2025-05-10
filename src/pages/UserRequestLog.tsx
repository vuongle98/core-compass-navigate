
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import DataFilters, { FilterOption } from "@/components/common/DataFilters";
import { ApiQueryFilters } from "@/hooks/use-api-query";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

const UserRequestLog = () => {
  const [filters, setFilters] = useState<ApiQueryFilters>({
    search: "",
    status: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Data refreshed successfully");
    }, 1000);
  };

  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search requests...",
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "success", label: "Success" },
        { value: "error", label: "Error" },
        { value: "pending", label: "Pending" },
      ],
    },
    {
      id: "date",
      label: "Date",
      type: "date",
    },
  ];

  const handleFilterChange = (newFilters: ApiQueryFilters) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      date: "",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="User Request Log"
          description="Track and analyze user requests"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          }
        />
        <DataFilters
          filters={filters}
          setFilters={handleFilterChange}
          resetFilters={resetFilters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          options={filterOptions}
          className="mt-4"
        />
        
        <div className="mt-4 border rounded-lg p-6">
          <p className="text-center text-muted-foreground">
            User request logs will appear here
          </p>
        </div>
      </main>
    </div>
  );
};

export default UserRequestLog;
