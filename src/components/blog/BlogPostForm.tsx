import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader } from "@/components/common/FileUploader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { BlogPost, BlogCategory, BlogTag } from "@/types/Blog";
import BlogService from "@/services/BlogService";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  coverImage: z.string().optional(),
  publishDate: z.date(),
  status: z.enum(["draft", "published", "scheduled"]),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof postSchema>;

interface BlogPostFormProps {
  post?: BlogPost;
  onSuccess?: () => void;
  isSubmitting?: boolean;
}

export const BlogPostForm = ({ post, onSuccess, isSubmitting = false }: BlogPostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(post?.coverImage);
  const [tagInput, setTagInput] = useState("");
  
  const isEditMode = !!post;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          BlogService.getCategories(),
          BlogService.getTags()
        ]);
        setCategories(categoriesRes.data);
        setTags(tagsRes.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load categories and tags.",
          variant: "destructive",
        });
      }
    };
    
    fetchData();
  }, [toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: post
      ? {
          ...post,
          publishDate: new Date(post.publishDate),
          tags: post.tags || [],
          metaKeywords: post.metaKeywords || [],
        }
      : {
          title: "",
          slug: "",
          content: "",
          excerpt: "",
          publishDate: new Date(),
          status: "draft",
          tags: [],
          metaKeywords: [],
        },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title') {
        const title = value.title as string;
        if (title) {
          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          form.setValue('slug', slug, { shouldValidate: true });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      const postData = {
        ...values,
        publishDate: values.publishDate.toISOString(),
        coverImage: coverImageUrl,
      };

      if (isEditMode) {
        await BlogService.updatePost(post.id, postData);
        toast({
          title: "Post updated",
          description: "The blog post has been updated successfully.",
        });
      } else {
        await BlogService.createPost(postData);
        toast({
          title: "Post created",
          description: "The blog post has been created successfully.",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/blogs");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: isEditMode
          ? "Failed to update the blog post. Please try again."
          : "Failed to create the blog post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const response = await BlogService.uploadImage(file);
      setCoverImageUrl(response.data.url);
      form.setValue('coverImage', response.data.url);
      toast({
        title: "Image uploaded",
        description: "Cover image has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues('metaKeywords') || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue('metaKeywords', [...currentTags, tagInput.trim()]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues('metaKeywords') || [];
    form.setValue(
      'metaKeywords',
      currentTags.filter((t) => t !== tag)
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="post-url-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be used in the URL of your post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post content here..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief summary of your post..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A short summary that appears in post listings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FileUploader
                onFileUpload={handleFileUpload}
                accept="image/*"
                previewUrl={coverImageUrl}
                className="w-full h-[200px]"
              />
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publishDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input placeholder="SEO title for this post" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        If left blank, the post title will be used
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="SEO description for this post"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Meta Keywords</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Add keywords separated by comma"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch('metaKeywords')?.map((tag) => (
                      <Badge key={tag} variant="outline" className="px-2 py-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeTag(tag)}
                        >
                          &times;
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/blogs")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditMode ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
