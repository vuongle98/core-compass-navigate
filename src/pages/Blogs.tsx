import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { useApiQuery } from "@/hooks/use-api-query";
import { useNavigate } from "react-router-dom";
import { BlogPost } from "@/types/Blog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Clock, MessageCircle, Bookmark, AlertCircle, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import BlogService from "@/services/BlogService";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Blogs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showError, setShowError] = useState(false);
  
  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search by title or content",
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" },
        { value: "scheduled", label: "Scheduled" },
      ],
    },
    {
      id: "category",
      label: "Category",
      type: "select",
      options: [
        { value: "all", label: "All Categories" },
        { value: "development", label: "Development" },
        { value: "design", label: "Design" },
        { value: "business", label: "Business" },
      ],
    },
  ];

  const {
    data: posts,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    totalPages,
    refresh,
    error,
  } = useApiQuery<BlogPost>({
    endpoint: "/api/blog/posts",
    queryKey: "blog-posts",
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: () => setShowError(true),
    mockData: {
      content: [
        {
          id: "post-1",
          title: "Getting Started with React Hooks",
          slug: "getting-started-with-react-hooks",
          content: "Introduction to React Hooks...",
          excerpt: "Learn how to use React Hooks to simplify your components and share stateful logic.",
          publishDate: "2023-05-15T10:30:00Z",
          status: "published",
          authorId: "author-1",
          authorName: "Jane Smith",
          categoryId: "cat-1",
          categoryName: "Development",
          commentCount: 8,
          viewCount: 1250,
          createdAt: "2023-05-10T08:15:00Z",
          updatedAt: "2023-05-15T10:30:00Z"
        },
        {
          id: "post-2",
          title: "Mastering CSS Grid Layout",
          slug: "mastering-css-grid-layout",
          content: "Understanding CSS Grid...",
          excerpt: "Learn how to create complex layouts with CSS Grid Layout.",
          publishDate: "2023-06-05T14:45:00Z",
          status: "published",
          authorId: "author-2",
          authorName: "John Doe",
          categoryId: "cat-2",
          categoryName: "Design",
          commentCount: 5,
          viewCount: 980,
          createdAt: "2023-06-01T09:20:00Z",
          updatedAt: "2023-06-05T14:45:00Z"
        },
        {
          id: "post-3",
          title: "SEO Strategies for 2023",
          slug: "seo-strategies-for-2023",
          content: "Latest SEO Trends...",
          excerpt: "Stay ahead of the competition with these effective SEO strategies for 2023.",
          publishDate: "2023-07-10T11:15:00Z",
          status: "draft",
          authorId: "author-3",
          authorName: "Sarah Williams",
          categoryId: "cat-3",
          categoryName: "Marketing",
          commentCount: 12,
          viewCount: 1520,
          createdAt: "2023-07-05T13:40:00Z",
          updatedAt: "2023-07-10T11:15:00Z"
        }
      ],
      totalElements: 3,
      totalPages: 1,
      number: 0,
      size: 10
    }
  });

  const handleDelete = async (id: string) => {
    try {
      await BlogService.deletePost(id);
      refresh();
      toast({
        title: "Post deleted",
        description: "The blog post has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the blog post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const hasCreatePermission = useMemo(() => {
    return user?.role === "admin" || user?.role === "editor";
  }, [user]);

  const columns = useMemo<Column<BlogPost>[]>(
    () => [
      {
        header: "Title",
        accessorKey: "title",
        cell: (post: BlogPost) => (
          <div>
            <div className="font-medium">{post.title}</div>
            <div className="text-sm text-muted-foreground truncate max-w-md">
              {post.excerpt || post.content.substring(0, 100)}...
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (post: BlogPost) => {
          let badgeVariant = "default";
          
          switch (post.status) {
            case "published":
              badgeVariant = "success";
              break;
            case "draft":
              badgeVariant = "secondary";
              break;
            case "scheduled":
              badgeVariant = "warning";
              break;
          }
          
          return (
            <div className="flex items-center">
              {post.status === "published" && <Eye className="h-3.5 w-3.5 mr-1.5" />}
              {post.status === "draft" && <Pencil className="h-3.5 w-3.5 mr-1.5" />}
              {post.status === "scheduled" && <Clock className="h-3.5 w-3.5 mr-1.5" />}
              <Badge variant={badgeVariant as any} className="capitalize">
                {post.status}
              </Badge>
            </div>
          );
        },
        sortable: true,
      },
      {
        header: "Author",
        accessorKey: "authorName",
        sortable: true,
      },
      {
        header: "Category",
        accessorKey: "categoryName",
        cell: (post: BlogPost) => (
          <div className="flex items-center">
            <Bookmark className="h-3.5 w-3.5 mr-1.5" />
            <span>{post.categoryName || "Uncategorized"}</span>
          </div>
        ),
        sortable: true,
      },
      {
        header: "Date",
        accessorKey: "publishDate",
        cell: (post: BlogPost) => (
          <span>{format(new Date(post.publishDate), "MMM dd, yyyy")}</span>
        ),
        sortable: true,
      },
      {
        header: "Comments",
        accessorKey: "commentCount",
        cell: (post: BlogPost) => (
          <div className="flex items-center">
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            <span>{post.commentCount}</span>
          </div>
        ),
        sortable: true,
      },
      {
        header: "Actions",
        id: "actions",
        cell: (post: BlogPost) => (
          <ActionsMenu
            actions={[
              {
                label: "Edit",
                type: "edit",
                onClick: () => navigate(`/blogs/${post.id}/edit`),
              },
              {
                label: "View",
                type: "view",
                onClick: () => navigate(`/blogs/${post.id}`),
              },
              {
                label: "Delete",
                type: "delete",
                onClick: () => handleDelete(post.id),
                destructive: true,
              },
            ]}
          />
        ),
      },
    ],
    [navigate]
  );

  const handleCreateBlog = () => {
    navigate("/blogs/new");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
        <PageHeader
          title="Blog Management"
          description="Create, edit, and manage your blog posts"
          showAddButton={hasCreatePermission}
          addButtonLabel="New Post"
          onAddButtonClick={handleCreateBlog}
        />

        {showError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There was an error loading blog posts. Using fallback data.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col lg:flex-row justify-between mb-4 gap-4">
          <Card className="w-full p-4">
            <DataFilters
              filters={filters}
              options={filterOptions}
              onChange={setFilters}
              onReset={resetFilters}
            />
          </Card>
          
          {hasCreatePermission && (
            <Button onClick={handleCreateBlog} className="lg:ml-4 whitespace-nowrap h-fit">
              <Plus className="h-4 w-4 mr-2" />
              Create Blog
            </Button>
          )}
        </div>

        <DataTable
          data={posts}
          columns={columns}
          title="Blog Posts"
          pagination={true}
          isLoading={isLoading}
          totalItems={totalItems}
          pageIndex={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </main>
    </div>
  );
};

export default Blogs;
