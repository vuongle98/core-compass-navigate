
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { Loader2, Plus } from "lucide-react";

interface Tag {
  id: number;
  name: string;
  slug: string;
  postCount?: number;
}

// Mock BlogService for now
const BlogService = {
  getTags: (): Promise<Tag[]> => {
    // Mock tags data
    return Promise.resolve([
      { id: 1, name: 'Technology', slug: 'technology', postCount: 5 },
      { id: 2, name: 'News', slug: 'news', postCount: 3 },
      { id: 3, name: 'Tutorials', slug: 'tutorials', postCount: 8 }
    ]);
  },
  createTag: (data: Partial<Tag>): Promise<Tag> => {
    return Promise.resolve({ id: Date.now(), name: data.name || '', slug: data.slug || '' });
  },
  updateTag: (id: number, data: Partial<Tag>): Promise<Tag> => {
    return Promise.resolve({ id, name: data.name || '', slug: data.slug || '' });
  },
  deleteTag: (id: number): Promise<void> => {
    return Promise.resolve();
  }
};

const BlogTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '' });

  // Load tags
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const data = await BlogService.getTags();
        setTags(data);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        toast.error("Failed to load tags");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleOpenModal = (tag?: Tag) => {
    if (tag) {
      setCurrentTag(tag);
      setFormData({ name: tag.name, slug: tag.slug });
      setIsEditing(true);
    } else {
      setCurrentTag(null);
      setFormData({ name: '', slug: '' });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentTag) {
        // Update existing tag
        const updatedTag = await BlogService.updateTag(currentTag.id, formData);
        // Update tags list with the updated tag
        setTags(tags.map(t => t.id === updatedTag.id ? updatedTag : t));
        toast.success("Tag updated successfully");
      } else {
        // Create new tag
        const newTag = await BlogService.createTag(formData);
        // Add new tag to the list
        setTags([...tags, newTag]);
        toast.success("Tag created successfully");
      }
      
      // Close modal and reset form
      setModalOpen(false);
      setFormData({ name: '', slug: '' });
      setCurrentTag(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save tag:", error);
      toast.error(isEditing ? "Failed to update tag" : "Failed to create tag");
    }
  };

  const handleDelete = async (tag: Tag) => {
    try {
      await BlogService.deleteTag(tag.id);
      setTags(tags.filter(t => t.id !== tag.id));
      toast.success("Tag deleted successfully");
    } catch (error) {
      console.error("Failed to delete tag:", error);
      toast.error("Failed to delete tag");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader title="Blog Tags" description="Manage your blog tags" />
        
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tags</CardTitle>
            <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Tag
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Post Count</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No tags found. Create your first tag.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tags.map(tag => (
                      <TableRow key={tag.id}>
                        <TableCell>{tag.name}</TableCell>
                        <TableCell>{tag.slug}</TableCell>
                        <TableCell>{tag.postCount || 0}</TableCell>
                        <TableCell>
                          <ActionsMenu
                            actions={[
                              {
                                type: "edit",
                                label: "Edit",
                                onClick: () => handleOpenModal(tag),
                              },
                              {
                                type: "delete",
                                label: "Delete",
                                onClick: () => handleDelete(tag),
                                disabled: (tag.postCount || 0) > 0,
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Tag" : "Create Tag"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter tag name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="enter-slug"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs, auto-generated from name if left empty
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Tag" : "Create Tag"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default BlogTags;
