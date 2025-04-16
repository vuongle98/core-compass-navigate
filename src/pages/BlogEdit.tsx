
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { BlogPost } from "@/types/Blog";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import BlogService from "@/services/BlogService";

const BlogEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        const response = await BlogService.getPost(id);
        setPost(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load blog post. Please try again.",
          variant: "destructive",
        });
        navigate("/blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate, toast]);

  const handleSuccess = () => {
    setIsSubmitting(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: "Blogs", path: "/blogs" },
            { label: "Edit Post", path: `/blogs/${id}/edit` },
          ]}
          className="mb-6"
        />
        <PageHeader
          title="Edit Blog Post"
          description="Update your blog post content and settings"
          showAddButton={false}
        />
        
        {loading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : post ? (
          <div className="mt-6">
            <BlogPostForm 
              post={post} 
              onSuccess={handleSuccess} 
              isSubmitting={isSubmitting}
            />
          </div>
        ) : (
          <div className="mt-6 text-center p-8">
            <p>Blog post not found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogEdit;
