
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Column } from "@/types/Common";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  lastLogin: string;
}

const TableStyleDemo = () => {
  // Sample data
  const users: User[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      status: "active",
      lastLogin: "2025-05-01T14:30:00Z",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Editor",
      status: "active",
      lastLogin: "2025-04-28T09:15:00Z",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "Viewer",
      status: "inactive",
      lastLogin: "2025-03-15T11:45:00Z",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice.brown@example.com",
      role: "Editor",
      status: "pending",
      lastLogin: "2025-05-02T08:20:00Z",
    },
    {
      id: 5,
      name: "Charlie Wilson",
      email: "charlie.wilson@example.com",
      role: "Viewer",
      status: "active",
      lastLogin: "2025-04-30T16:10:00Z",
    },
  ];

  // Table columns
  const columns: Column<User>[] = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Role",
      accessorKey: "role",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (user) => (
        <Badge
          className={
            user.status === "active"
              ? "bg-green-100 text-green-800"
              : user.status === "inactive"
              ? "bg-gray-100 text-gray-800"
              : "bg-yellow-100 text-yellow-800"
          }
        >
          {user.status}
        </Badge>
      ),
    },
    {
      header: "Last Login",
      accessorKey: "lastLogin",
      cell: (user) => {
        const date = new Date(user.lastLogin);
        return new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);
      },
    },
  ];

  // DataTable columns
  const dataTableColumns: Column<User>[] = [
    {
      header: "ID",
      accessorKey: "id",
      cell: (user) => <span className="font-mono">{user.id}</span>,
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Role",
      accessorKey: "role",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (user) => (
        <Badge
          className={
            user.status === "active"
              ? "bg-green-100 text-green-800"
              : user.status === "inactive"
              ? "bg-gray-100 text-gray-800"
              : "bg-yellow-100 text-yellow-800"
          }
        >
          {user.status}
        </Badge>
      ),
    },
    {
      header: "Last Login",
      accessorKey: "lastLogin",
      cell: (user) => {
        const date = new Date(user.lastLogin);
        return new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);
      },
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Table Styles Demo"
          description="Compare different table implementations"
        />

        <Tabs defaultValue="responsive" className="mt-6">
          <TabsList>
            <TabsTrigger value="responsive">Responsive Table</TabsTrigger>
            <TabsTrigger value="datatable">Data Table</TabsTrigger>
          </TabsList>
          <TabsContent value="responsive" className="mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">ResponsiveTable Component</h3>
              <p className="text-muted-foreground mb-4">
                This table automatically adapts to screen size. Try resizing the window to see it in action.
              </p>
              <ResponsiveTable data={users} columns={columns} />
            </Card>
          </TabsContent>
          <TabsContent value="datatable" className="mt-4">
            <DataTable
              data={users}
              columns={dataTableColumns}
              title="Users"
              pagination={true}
              pageSize={5}
              totalItems={users.length}
              showAddButton={true}
              onAddClick={() => alert("Add button clicked")}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TableStyleDemo;
