
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/types/Common";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  lastLogin: string;
}

const dummyUsers: User[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2025-05-01T10:30:00Z",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "Editor",
    status: "active",
    lastLogin: "2025-05-02T14:15:00Z",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    role: "User",
    status: "inactive",
    lastLogin: "2025-04-25T09:45:00Z",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@example.com",
    role: "Editor",
    status: "pending",
    lastLogin: "2025-05-03T16:20:00Z",
  },
  {
    id: 5,
    name: "James Davis",
    email: "james@example.com",
    role: "User",
    status: "active",
    lastLogin: "2025-05-01T08:10:00Z",
  },
];

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: User["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-500 hover:bg-green-600";
    case "inactive":
      return "bg-red-500 hover:bg-red-600";
    case "pending":
      return "bg-yellow-500 hover:bg-yellow-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

const TableDemo = () => {
  const columns: Column<User>[] = [
    { header: "ID", accessorKey: "id" },
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (user) => (
        <Badge className={getStatusColor(user.status)}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Last Login",
      accessorKey: "lastLogin",
      cell: (user) => formatDate(user.lastLogin),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (user) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Users Table</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            data={dummyUsers}
            columns={columns}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TableDemo;
