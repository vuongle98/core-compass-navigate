import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Eye,
  MessageSquare,
  ThumbsUp,
  Trash,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { User } from "@/types/Auth";

// Mock blog post data
const mockPost = {
  id: 1,
  title: "Getting Started with React and TypeScript",
  content: `
  <p>TypeScript is a powerful superset of JavaScript that adds static typing to the language. When combined with React, it provides a robust development experience with better tooling, improved code quality, and fewer bugs.</p>
  
  <h2>Why Use TypeScript with React?</h2>
  
  <p>Using TypeScript with React offers several advantages:</p>
  
  <ul>
    <li>Catch errors during development rather than at runtime</li>
    <li>Better IDE support with autocompletion and type checking</li>
    <li>Improved code documentation through explicit type definitions</li>
    <li>Safer refactoring with immediate feedback on type errors</li>
  </ul>
  
  <h2>Setting Up a New Project</h2>
  
  <p>You can quickly create a new React project with TypeScript using Create React App:</p>
  
  <pre><code>npx create-react-app my-app --template typescript</code></pre>
  
  <p>This command sets up a new React project with TypeScript configuration already in place.</p>
  
  <h2>Basic Component Example</h2>
  
  <p>Here's a simple React component written in TypeScript:</p>
  
  <pre><code>import React from 'react';

interface GreetingProps {
  name: string;
  age?: number;
}

const Greeting: React.FC&lt;GreetingProps&gt; = ({ name, age }) => {
  return (
    &lt;div&gt;
      &lt;h1&gt;Hello, {name}!&lt;/h1&gt;
      {age && &lt;p&gt;You are {age} years old.&lt;/p&gt;}
    &lt;/div&gt;
  );
};

export default Greeting;</code></pre>
  
  <p>In this example, we define an interface <code>GreetingProps</code> that specifies the props our component accepts. The <code>?</code> after <code>age</code> indicates that this prop is optional.</p>
  
  <h2>Conclusion</h2>
  
  <p>TypeScript and React make a powerful combination for building robust web applications. With proper type definitions, you can catch errors early, improve code quality, and enhance the development experience.</p>
  `,
  author: {
    id: 1,
    username: "johndoe",
    email: "john@example.com",
    avatar: "/avatars/john.png",
    roles: [], // Add empty roles array to match User type
  },
  publishedAt: "2023-05-15T10:30:00Z",
  updatedAt: "2023-05-16T14:20:00Z",
  tags: ["React", "TypeScript", "Frontend"],
  views: 1245,
  likes: 87,
  comments: 23,
  status: "published",
};

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(mockPost);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  const handleEdit = () => {
    navigate(`/blogs/${id}/edit`);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // Simulate API call
    toast.success("Blog post deleted successfully");
    navigate("/blogs");
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const formatAuthorName = (author: User) => {
    if (!author) return "Unknown";
    return author.username || "Anonymous";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Breadcrumbs />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs />
        <PageHeader
          title={post.title}
          description={`Published on ${formatDate(post.publishedAt)}`}
          actions={
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate("/blog")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
              {user && user.id === post.author.id && (
                <>
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          }
        />

        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar>
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>
                    {formatAuthorName(post.author)
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {formatAuthorName(post.author)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {post.updatedAt !== post.publishedAt
                      ? `Updated on ${formatDate(post.updatedAt)}`
                      : `Published on ${formatDate(post.publishedAt)}`}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div
                className="prose prose-sm sm:prose lg:prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="flex items-center space-x-6 mt-8 pt-6 border-t">
                <div className="flex items-center text-muted-foreground">
                  <Eye className="mr-2 h-4 w-4" />
                  <span>{post.views} views</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  <span>{post.likes} likes</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>{post.comments} comments</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{format(new Date(post.publishedAt), "h:mm a")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogDetail;
