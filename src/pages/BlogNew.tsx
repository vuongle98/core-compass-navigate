
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

const BlogNew = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    setIsSubmitting(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Blogs", href: "/blogs" },
            { label: "New Post", href: "/blogs/new" },
          ]}
          className="mb-6"
        />
        <PageHeader
          title="Create New Blog Post"
          description="Create a new blog post with rich content"
          showAddButton={false}
        />
        <div className="mt-6">
          <BlogPostForm 
            onSuccess={handleSuccess}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </div>
  );
};

export default BlogNew;
