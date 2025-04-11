
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";

const Index = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Dashboard" 
          description="Welcome to the Core Application Dashboard"
          showAddButton={false}
        />
        
        <div className="grid gap-6 mt-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <p className="text-muted-foreground">
              This is your core application dashboard. Use the sidebar navigation to 
              explore different modules of the application.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>Manage users, roles and permissions</li>
              <li>Generate and revoke access tokens</li>
              <li>Upload and organize files</li>
              <li>Configure notifications</li>
              <li>Set application parameters</li>
              <li>Toggle feature flags</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
