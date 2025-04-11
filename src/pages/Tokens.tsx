
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

const Tokens = () => {
  // Mock data
  const tokens = [
    { 
      id: 1, 
      name: "Mobile API Token", 
      lastUsed: "2023-04-10", 
      expires: "2023-07-10",
      status: "Active"
    },
    { 
      id: 2, 
      name: "Web Integration", 
      lastUsed: "2023-04-09", 
      expires: "2023-05-15",
      status: "Active"
    },
    { 
      id: 3, 
      name: "Analytics Service", 
      lastUsed: "2023-04-01", 
      expires: "2023-04-05",
      status: "Expired"
    },
  ];

  const columns = [
    { header: "Token Name", accessorKey: "name" },
    { header: "Last Used", accessorKey: "lastUsed" },
    { header: "Expires", accessorKey: "expires" },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (token) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          token.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {token.status}
        </span>
      )
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="API Tokens" 
          description="Manage API access tokens"
        />
        
        <div className="mt-6">
          <DataTable data={tokens} columns={columns} title="Token Management" />
        </div>
      </main>
    </div>
  );
};

export default Tokens;
