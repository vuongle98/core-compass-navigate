import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { BlogTag } from "@/types/Blog";
import BlogService from "@/services/BlogService";
import { Plus, Pencil, Trash2, Tag, Check, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnimationClass } from "@/lib/animation";

const BlogTags = () => {
  const { toast } = useToast();
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTag, setCurrentTag] = useState<Partial<BlogTag>>({
    name: "",
    description: "",
    color: "#3b82f6",
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  // Animation classes
  const fadeIn = getAnimationClass({
    type: "fade-in",
    duration: 300,
  });

  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, []);

  // Load all tags
  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await BlogService.getTags();
      if (response.success) {
        setTags(response.data.content);
      }
    } catch (error) {
      console.error("Error loading tags:", error);
      toast({
        title: "Error",
        description: "Failed to load tags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add tag
  const addNewTag = () => {
    setCurrentTag({
      name: "",
      description: "",
      color: "#3b82f6",
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  // Edit tag
  const editTag = (tag: BlogTag) => {
    setCurrentTag({ ...tag });
    setIsEditing(true);
    setModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!currentTag.name) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      let response;

      if (isEditing && currentTag.id) {
        // Convert id to string for updateTag method
        const tagId = String(currentTag.id);
        response = await BlogService.updateTag(tagId, currentTag);
        if (response.success) {
          toast({
            title: "Success",
            description: "Tag updated successfully",
          });
        }
      } else {
        response = await BlogService.createTag(currentTag);
        if (response.success) {
          toast({
            title: "Success",
            description: "Tag created successfully",
          });
        }
      }

      // Refresh tags list
      loadTags();
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving tag:", error);
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update tag"
          : "Failed to create tag",
        variant: "destructive",
      });
    }
  };

  // Delete a tag
  const deleteTag = async (id: string | number) => {
    try {
      setDeleting(String(id));
      // Convert id to string for deleteTag method
      const response = await BlogService.deleteTag(String(id));
      if (response.success) {
        toast({
          title: "Success",
          description: "Tag deleted successfully",
        });
        // Update local state to remove the deleted tag
        setTags(tags.filter((tag) => tag.id !== id));
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
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
            { label: "Tags", path: "/blog-tags" },
          ]}
          className="mb-4"
        />
        <PageHeader
          title="Blog Tags"
          description="Manage tags for your blog posts"
          showAddButton
          addButtonLabel="Add Tag"
          onAddButtonClick={addNewTag}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {loading
            ? // Skeleton loading state
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={`skeleton-${i}`} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between items-center mt-4">
                      <Skeleton className="h-8 w-16 rounded-full" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : tags.map((tag) => (
                <Card key={tag.id} className={`overflow-hidden ${fadeIn}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span
                            className="block w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color || "#3b82f6" }}
                          />
                          {tag.name}
                        </CardTitle>
                        <CardDescription>{tag.slug}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        {tag.postCount || 0} posts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                      {tag.description || "No description"}
                    </p>
                    <div className="flex justify-end items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => editTag(tag)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        disabled={deleting === String(tag.id)}
                        onClick={() => deleteTag(tag.id)}
                      >
                        {deleting === String(tag.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {tags.length === 0 && !loading && (
          <Card className="mt-4 p-8 text-center">
            <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Tags Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven't created any tags yet. Create your first tag to
              organize your blog posts.
            </p>
            <Button className="mt-4" onClick={addNewTag}>
              <Plus className="mr-2 h-4 w-4" /> Add Tag
            </Button>
          </Card>
        )}

        {/* Tag Edit/Create Dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Tag" : "Create New Tag"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the tag details below."
                  : "Fill in the details to create a new tag."}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 py-2 px-1">
                <div className="space-y-2">
                  <Label htmlFor="name">Tag Name *</Label>
                  <Input
                    id="name"
                    value={currentTag.name || ""}
                    onChange={(e) =>
                      setCurrentTag({ ...currentTag, name: e.target.value })
                    }
                    placeholder="Enter tag name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={currentTag.description || ""}
                    onChange={(e) =>
                      setCurrentTag({
                        ...currentTag,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter tag description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="color"
                      value={currentTag.color || "#3b82f6"}
                      onChange={(e) =>
                        setCurrentTag({ ...currentTag, color: e.target.value })
                      }
                      className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={currentTag.color || "#3b82f6"}
                      onChange={(e) =>
                        setCurrentTag({ ...currentTag, color: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                <Check className="mr-2 h-4 w-4" />
                {isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default BlogTags;
