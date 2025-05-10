
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import DataFilters from "@/components/common/DataFilters";
import { ApiQueryFilters } from "@/hooks/use-api-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import FileService from "@/services/FileService";

const Files = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const { toast } = useToast();
  
  const filterOptions = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search files..."
    }
  ];

  const handleFilterChange = (newFilters: ApiQueryFilters) => {
    setSearchTerm(newFilters.search as string);
    const updateSearchParams = (filters: ApiQueryFilters) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, value.toString());
        }
      });
      setSearchParams(params);
    };
    updateSearchParams(newFilters);
  };
  
  const resetFilters = () => {
    setSearchTerm("");
    setSearchParams({});
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Files" 
          description="Manage your files and documents" 
        />

        <DataFilters
          filters={{ search: searchTerm }}
          setFilters={handleFilterChange}
          resetFilters={resetFilters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          options={filterOptions}
          className="mt-4"
        />

        {/* File content would go here */}
        <div className="mt-4 p-6 border rounded-lg">
          <p className="text-center text-muted-foreground">
            Your files will appear here
          </p>
        </div>
      </main>
    </div>
  );
};

export default Files;
