
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/common/PageHeader';
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { BlogCategory } from '@/types/Blog';
import BlogService from '@/services/BlogService';
import { Plus, Pencil, Trash2, Tag, FolderOpen, Check, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getAnimationClass } from '@/lib/animation';

const BlogCategories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<BlogCategory>>({
    name: '',
    description: '',
    color: '#3b82f6',
    isActive: true
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  // Animation classes
  const fadeIn = getAnimationClass({
    type: 'fade-in',
    duration: 300,
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load all categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await BlogService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Open modal for new category
  const addNewCategory = () => {
    setCurrentCategory({
      name: '',
      description: '',
      color: '#3b82f6',
      isActive: true
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  // Open modal for editing
  const editCategory = (category: BlogCategory) => {
    setCurrentCategory({ ...category });
    setIsEditing(true);
    setModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!currentCategory.name) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      let response;

      if (isEditing && currentCategory.id) {
        const categoryId = String(currentCategory.id);
        response = await BlogService.updateCategory(categoryId, currentCategory);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Category updated successfully',
          });
        }
      } else {
        response = await BlogService.createCategory(currentCategory);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Category created successfully',
          });
        }
      }

      // Refresh categories list
      loadCategories();
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: isEditing ? 'Failed to update category' : 'Failed to create category',
        variant: 'destructive',
      });
    }
  };

  // Delete a category
  const deleteCategory = async (id: string | number) => {
    try {
      setDeleting(String(id));
      const response = await BlogService.deleteCategory(String(id));
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Category deleted successfully',
        });
        // Update local state to remove the deleted category
        setCategories(categories.filter(cat => cat.id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category',
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
            { label: "Categories", path: "/blog-categories" },
          ]}
          className="mb-4"
        />
        <PageHeader
          title="Blog Categories"
          description="Manage categories for your blog posts"
          showAddButton
          addButtonLabel="Add Category"
          onAddButtonClick={addNewCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {loading ? (
            // Skeleton loading state
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
          ) : (
            categories.map((category) => (
              <Card key={category.id} className={`overflow-hidden ${fadeIn}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span
                          className="block w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || '#3b82f6' }}
                        />
                        {category.name}
                      </CardTitle>
                      <CardDescription>{category.slug}</CardDescription>
                    </div>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                    {category.description || "No description"}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" />
                      {category.postCount || 0} posts
                    </Badge>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => editCategory(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        disabled={deleting === String(category.id)}
                        onClick={() => deleteCategory(category.id)}
                      >
                        {deleting === String(category.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {categories.length === 0 && !loading && (
          <Card className="mt-4 p-8 text-center">
            <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Categories Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven't created any categories yet. Create your first category to organize your blog posts.
            </p>
            <Button className="mt-4" onClick={addNewCategory}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </Card>
        )}

        {/* Category Edit/Create Dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Category" : "Create New Category"}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the category details below."
                  : "Fill in the details to create a new category."}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 py-2 px-1">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={currentCategory.name || ''}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={currentCategory.description || ''}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="color"
                      value={currentCategory.color || '#3b82f6'}
                      onChange={(e) => setCurrentCategory({ ...currentCategory, color: e.target.value })}
                      className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={currentCategory.color || '#3b82f6'}
                      onChange={(e) => setCurrentCategory({ ...currentCategory, color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={currentCategory.isActive || false}
                    onCheckedChange={(checked) => setCurrentCategory({ ...currentCategory, isActive: checked })}
                  />
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

export default BlogCategories;
