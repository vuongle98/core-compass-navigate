
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/common/PageHeader';
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { BlogTag } from '@/types/Blog';
import BlogService from '@/services/BlogService';
import { Plus, Pencil, Trash2, Tag, Loader2, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getAnimationClass } from '@/lib/animation';

const BlogTags = () => {
  const { toast } = useToast();
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTag, setCurrentTag] = useState<Partial<BlogTag>>({
    name: '',
    color: '#3b82f6'
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  // Animation class
  const fadeIn = getAnimationClass({
    type: 'fade-in',
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
        setTags(response.data);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tags. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Open modal for new tag
  const addNewTag = () => {
    setCurrentTag({
      name: '',
      color: '#3b82f6'
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  // Open modal for editing
  const editTag = (tag: BlogTag) => {
    setCurrentTag({ ...tag });
    setIsEditing(true);
    setModalOpen(true);
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!currentTag.name) {
      toast({
        title: 'Error',
        description: 'Tag name is required',
        variant: 'destructive',
      });
      return;
    }

    // Auto-generate slug if not provided
    if (!currentTag.slug) {
      currentTag.slug = generateSlug(currentTag.name);
    }

    try {
      let response;

      if (isEditing && currentTag.id) {
        response = await BlogService.updateTag(currentTag.id, currentTag);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Tag updated successfully',
          });
        }
      } else {
        response = await BlogService.createTag(currentTag);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Tag created successfully',
          });
        }
      }

      // Refresh tags list
      loadTags();
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({
        title: 'Error',
        description: isEditing ? 'Failed to update tag' : 'Failed to create tag',
        variant: 'destructive',
      });
    }
  };

  // Delete a tag
  const deleteTag = async (id: string) => {
    try {
      setDeleting(id);
      const response = await BlogService.deleteTag(id);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Tag deleted successfully',
        });
        // Update local state to remove the deleted tag
        setTags(tags.filter(tag => tag.id !== id));
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        variant: 'destructive',
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

        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tags</CardTitle>
              <CardDescription>
                Tags help categorize your content for better organization and discoverability
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton 
                      key={`skeleton-${i}`}
                      className="h-8 w-20 rounded-full"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {tags.map((tag) => (
                    <div 
                      key={tag.id} 
                      className={`group relative ${fadeIn}`}
                    >
                      <Badge
                        className="px-3 py-1.5 text-sm h-8"
                        style={{ backgroundColor: tag.color }}
                      >
                        <span className="mr-1">#</span>
                        {tag.name}
                        <span className="ml-2 bg-white bg-opacity-20 px-1.5 rounded-full text-xs">
                          {tag.postCount}
                        </span>
                      </Badge>
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-6 w-6 rounded-full shadow-sm"
                          onClick={() => editTag(tag)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-6 w-6 rounded-full shadow-sm ml-1"
                          disabled={deleting === tag.id}
                          onClick={() => deleteTag(tag.id)}
                        >
                          {deleting === tag.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {tags.length === 0 && !loading && (
              <CardFooter className="flex flex-col items-center p-6 border-t">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Tags Found</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4">
                  You haven't created any tags yet. Tags help categorize and organize your blog posts.
                </p>
                <Button onClick={addNewTag}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Tag
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Tag Edit/Create Dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Tag" : "Create New Tag"}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the tag details below."
                  : "Fill in the details to create a new tag."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tag Name *</Label>
                <Input
                  id="name"
                  value={currentTag.name || ''}
                  onChange={(e) => setCurrentTag({ 
                    ...currentTag, 
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  })}
                  placeholder="Enter tag name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={currentTag.slug || ''}
                  onChange={(e) => setCurrentTag({ ...currentTag, slug: e.target.value })}
                  placeholder="Enter slug"
                  className="text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  The slug is automatically generated from the name, but you can customize it.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color"
                    value={currentTag.color || '#3b82f6'}
                    onChange={(e) => setCurrentTag({ ...currentTag, color: e.target.value })}
                    className="w-10 h-10 rounded-md border cursor-pointer"
                  />
                  <Input
                    value={currentTag.color || '#3b82f6'}
                    onChange={(e) => setCurrentTag({ ...currentTag, color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

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
