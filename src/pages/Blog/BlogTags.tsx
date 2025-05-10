
// Update the loadTags and handleSubmit functions in BlogTags.tsx to handle the proper response format

const loadTags = async () => {
  setLoading(true);
  try {
    const response = await BlogService.getTags();
    // Update to handle the direct response structure
    setTags(response.content || []);
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
    if (isEditing && currentTag.id) {
      const tagId = String(currentTag.id);
      await BlogService.updateTag(tagId, currentTag);
      toast({
        title: "Success",
        description: "Tag updated successfully",
      });
    } else {
      await BlogService.createTag(currentTag);
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    }

    // Refresh tags list
    loadTags();
    setModalOpen(false);
  } catch (error) {
    console.error("Error saving tag:", error);
    toast({
      title: "Error",
      description: isEditing ? "Failed to update tag" : "Failed to create tag",
      variant: "destructive",
    });
  }
};
