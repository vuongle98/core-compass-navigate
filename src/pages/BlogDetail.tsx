
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { BlogPost, BlogComment } from "@/types/Blog";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar, 
  Clock, 
  Tag, 
  Bookmark, 
  Eye, 
  MessageCircle,
  Pencil,
  Trash2,
  Send
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import BlogService from "@/services/BlogService";
import { useAuth } from "@/contexts/AuthContext";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        const response = await BlogService.getPost(id);
        setPost(response.data as BlogPost);
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

    const fetchComments = async () => {
      if (!id) return;

      try {
        const response = await BlogService.getComments(id);
        setComments(response.data.content);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load comments.",
          variant: "destructive",
        });
      } finally {
        setCommentLoading(false);
      }
    };

    fetchPost();
    fetchComments();
  }, [id, navigate, toast]);

  const handleCommentSubmit = async (values: { content: string }) => {
    if (!id || !user) return;

    setSubmittingComment(true);

    try {
      const newComment = {
        postId: id,
        authorId: user.id,
        authorName: user.name || user.email,
        authorEmail: user.email,
        content: values.content,
        status: 'pending' as 'pending' | 'approved' | 'rejected',
      };

      await BlogService.addComment(id, newComment);
      
      const response = await BlogService.getComments(id);
      setComments(response.data.content);
      
      form.reset();
      
      toast({
        title: "Comment submitted",
        description: "Your comment has been submitted and is awaiting approval.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/blogs/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await BlogService.deletePost(id);
      toast({
        title: "Post deleted",
        description: "The blog post has been deleted successfully.",
      });
      navigate("/blogs");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the blog post. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 text-center">
          <p className="text-xl">Blog post not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: "Blogs", path: "/blogs" },
            { label: post?.title || "Blog Post", path: `/blogs/${id}` },
          ]}
          className="mb-4"
        />
        
        <div className="flex justify-between items-center mb-4">
          <PageHeader
            title={post.title}
            description={`Published on ${format(new Date(post.publishDate), "MMMM dd, yyyy")}`}
            showAddButton={false}
          />
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEdit}
            >
              <Pencil className="mr-1 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        
        <Card className="mb-8">
          {post.coverImage && (
            <div className="h-[300px] overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {post.authorName?.substring(0, 2).toUpperCase() || "AU"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{post.authorName}</p>
                <div className="flex items-center text-sm text-muted-foreground space-x-3">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(post.publishDate), "MMM d, yyyy")}
                  </span>
                  {post.status === "scheduled" && (
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Scheduled
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge variant={
              post?.status === "published" ? "default" : 
              post?.status === "draft" ? "secondary" : 
              "outline"
            } className="capitalize">
              {post?.status}
            </Badge>
          </CardHeader>
          
          <CardContent className="prose max-w-none">
            <div className="whitespace-pre-wrap">
              {post.content}
            </div>
            
            <div className="flex flex-wrap mt-4">
              {post.categoryName && (
                <div className="flex items-center mr-4">
                  <Bookmark className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm">{post.categoryName}</span>
                </div>
              )}
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center flex-wrap">
                  <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4 flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Eye className="mr-1 h-4 w-4" />
                {post.viewCount} views
              </span>
              <span className="flex items-center">
                <MessageCircle className="mr-1 h-4 w-4" />
                {post.commentCount} comments
              </span>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <Separator className="mb-4" />
          
          {commentLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {comment.authorName?.substring(0, 2).toUpperCase() || "AU"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
          
          <Card className="mt-8">
            <CardHeader>
              <h3 className="text-lg font-medium">Add a Comment</h3>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCommentSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Write your comment here..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={submittingComment}>
                      {submittingComment ? "Submitting..." : "Submit Comment"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BlogDetail;
