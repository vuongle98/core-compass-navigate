
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { useApiQuery } from "@/hooks/use-api-query";
import { useNavigate } from "react-router-dom";
import { BlogPost } from "@/types/Blog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Clock, MessageCircle, Tag, Bookmark } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import BlogService from "@/services/BlogService";
import { DataTable, Column } from "@/components/ui/DataTable";

const Blogs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Filter options for DataFilters component
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
  ];

  // Query for blog posts
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
  } = useApiQuery<BlogPost>({
    endpoint: "/api/blog/posts",
    queryKey: "blog-posts",
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
  });

  // Handle delete post
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

  // Define columns for the DataTable
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
          let icon = null;
          
          switch (post.status) {
            case "published":
              badgeVariant = "success";
              icon = <Eye className="h-3 w-3 mr-1" />;
              break;
            case "draft":
              badgeVariant = "secondary";
              icon = <Pencil className="h-3 w-3 mr-1" />;
              break;
            case "scheduled":
              badgeVariant = "warning";
              icon = <Clock className="h-3 w-3 mr-1" />;
              break;
          }
          
          return (
            <Badge variant={badgeVariant as any} className="capitalize flex items-center w-fit">
              {icon}
              {post.status}
            </Badge>
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
            <Bookmark className="h-3 w-3 mr-1" />
            {post.categoryName || "Uncategorized"}
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
            <MessageCircle className="h-3 w-3 mr-1" />
            {post.commentCount}
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
                icon: Pencil,
                onClick: () => navigate(`/blogs/${post.id}/edit`),
              },
              {
                label: "View",
                icon: Eye,
                onClick: () => navigate(`/blogs/${post.id}`),
              },
              {
                label: "Delete",
                icon: Trash2,
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
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Blog Management"
          description="Create, edit, and manage your blog posts"
          showAddButton
          onAddButtonClick={handleCreateBlog}
          addButtonLabel="New Post"
        >
          <DataFilters
            filters={filters}
            options={filterOptions}
            onChange={setFilters}
            onReset={resetFilters}
            className="mb-6"
          />
        </PageHeader>

        <DataTable
          data={posts}
          columns={columns}
          title="Blog Posts"
          pagination={true}
          showAddButton={false}
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
