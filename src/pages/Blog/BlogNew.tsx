import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { toast } from "sonner";
import { BlogPost } from "@/types/Blog";
import BlogService from "@/services/BlogService";

const BlogNew = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData: BlogPost) => {
    setIsSubmitting(true);
    try {
      // Process form submission
      await BlogService.createPost(formData);
      toast.success("Blog post created successfully");
      navigate("/blogs");
    } catch (error) {
      toast.error("Failed to create blog post");
      console.error("Error creating blog post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: "Blogs", path: "/blogs" },
            { label: "New Post", path: "/blogs/new" },
          ]}
          className="mb-4"
        />
        <PageHeader
          title="Create New Blog Post"
          description="Create a new blog post with rich content"
          showAddButton={false}
        />
        <div className="mt-4">
          <BlogPostForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
      </main>
    </div>
  );
};

export default BlogNew;
