import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import useApiQuery from "@/hooks/use-api-query";
import { DataTable } from "@/components/ui/DataTable";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DataFilters, { FilterOption } from "@/components/common/DataFilters";
import { Skeleton } from "@/components/ui/skeleton";

// Define the Blog interface
interface Blog {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  status: "published" | "draft" | "archived";
}

const Blogs = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const {
    data: blogs,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
  } = useApiQuery<Blog>({
    endpoint: "/api/blogs",
    queryKey: ["blogs"],
    initialPageSize: 5,
    persistFilters: true,
    mockData: {
      content: [
        {
          id: 1,
          title: "First Blog Post",
          content: "This is the content of the first blog post.",
          author: "John Doe",
          createdAt: "2024-01-01T12:00:00Z",
          updatedAt: "2024-01-01T12:00:00Z",
          status: "published",
        },
        {
          id: 2,
          title: "Second Blog Post",
          content: "This is the content of the second blog post.",
          author: "Jane Smith",
          createdAt: "2024-01-05T14:30:00Z",
          updatedAt: "2024-01-05T14:30:00Z",
          status: "draft",
        },
      ],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 10,
    },
    onError: (err) => {
      console.error("Failed to fetch blogs:", err);
      toast.error("Failed to load blogs, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
  });

  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search title, author...",
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" },
        { value: "archived", label: "Archived" },
      ],
    },
  ];

  const handleView = (blog: Blog) => {
    navigate(`/blogs/${blog.id}`);
  };

  const handleEdit = (blog: Blog) => {
    navigate(`/blogs/edit/${blog.id}`);
  };

  const handleDelete = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBlog) {
      // Simulate API delete request
      toast.success(`Blog "${selectedBlog.title}" deleted successfully.`);
      setIsDialogOpen(false);
    }
  };

  const cancelDelete = () => {
    setIsDialogOpen(false);
    setSelectedBlog(null);
  };

  const handleAddBlog = () => {
    navigate("/blogs/new");
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: Blog) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
    },
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Author",
      accessorKey: "author",
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: Blog) => (
        <Badge
          variant={
            item.status === "published"
              ? "default"
              : item.status === "draft"
              ? "secondary"
              : "destructive"
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions" as keyof Blog,
      cell: (item: Blog) => (
        <ActionsMenu
          actions={[
            {
              type: "view",
              label: "View",
              onClick: () => handleView(item),
            },
            {
              type: "edit",
              label: "Edit",
              onClick: () => handleEdit(item),
            },
            {
              type: "delete",
              label: "Delete",
              onClick: () => handleDelete(item),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader title="Blogs" description="Manage blog posts" />
        <DataFilters
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          options={filterOptions}
          className="mt-4"
        />
        {isLoading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="mt-4">
            <DataTable
              addButtonText="Create new"
              onAddClick={handleAddBlog}
              data={blogs || []}
              columns={columns}
              title="Blog Posts"
              pagination={true}
              showAddButton={true}
              pageIndex={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              totalItems={totalItems}
            />
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Delete Blog</h2>
              <p>Are you sure you want to delete "{selectedBlog?.title}"?</p>
              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="ghost" onClick={cancelDelete}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Blogs;
