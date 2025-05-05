import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { BlogPost, BlogCategory, BlogPostFormProps } from "@/types/Blog";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/Auth";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import TagInput from "@/components/ui/tag-input";
import ImageUpload from "@/components/ui/image-upload";
import EnhancedApiService from "@/services/EnhancedApiService";

// Define the form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  isPublished: z.boolean().default(false),
  slug: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BlogPostForm({
  initialData,
  onSubmit,
  isLoading = false,
}: BlogPostFormProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [content, setContent] = useState(initialData?.content || "");
  const [featuredImage, setFeaturedImage] = useState<string | undefined>(
    initialData?.featuredImage
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      categoryId: initialData?.categoryId?.toString() || "",
      tags: initialData?.tags || [],
      featuredImage: initialData?.featuredImage || "",
      isPublished: initialData?.isPublished || false,
      slug: initialData?.slug || "",
    },
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await EnhancedApiService.get<BlogCategory[]>(
          "/api/blog/categories"
        );
        setCategories(response || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Update form when content changes
  useEffect(() => {
    form.setValue("content", content);
  }, [content, form]);

  // Update form when featured image changes
  useEffect(() => {
    if (featuredImage) {
      form.setValue("featuredImage", featuredImage);
    }
  }, [featuredImage, form]);

  // Update form when tags change
  useEffect(() => {
    form.setValue("tags", tags);
  }, [tags, form]);

  // Generate slug from title
  const generateSlug = () => {
    const title = form.getValues("title");
    if (!title) {
      toast.error("Please enter a title first");
      return;
    }

    setIsGeneratingSlug(true);
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
    
    form.setValue("slug", slug);
    setIsGeneratingSlug(false);
    toast.success("Slug generated");
  };

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Format author name
  const formatAuthorName = (user: User | null): string => {
    if (!user) return "Unknown";
    return user.username || "Anonymous"; // Use username instead of name
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Write your post content here..."
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
                      placeholder="Brief summary of your post"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Publish</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Make this post publicly visible
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingCategories}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input placeholder="post-slug" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateSlug}
                          disabled={isGeneratingSlug}
                        >
                          {isGeneratingSlug ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Generate"
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <TagInput
                          placeholder="Add tags..."
                          tags={tags}
                          setTags={setTags}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={() => (
                    <FormItem>
                      <FormLabel>Featured Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={featuredImage}
                          onChange={setFeaturedImage}
                          onRemove={() => setFeaturedImage(undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Author: {formatAuthorName(user)}
                  </p>
                  {initialData?.createdAt && (
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(initialData.createdAt).toLocaleDateString()}
                    </p>
                  )}
                  {initialData?.updatedAt && (
                    <p className="text-sm text-muted-foreground">
                      Updated: {new Date(initialData.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Post
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
