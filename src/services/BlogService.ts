
import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";
import { BlogPost, BlogCategory, BlogTag, BlogMedia, BlogComment } from "@/types/Blog";
import ServiceRegistry from "./ServiceRegistry";

/**
 * Service for managing blog-related functionality
 */
class BlogService {
  private static instance: BlogService;
  private logger = LoggingService.getInstance();

  private constructor() {
    this.logger.info('BlogService initialized');
  }

  public static getInstance(): BlogService {
    if (!BlogService.instance) {
      BlogService.instance = new BlogService();
    }
    return BlogService.instance;
  }

  /**
   * Create a new blog post
   * @param postData Blog post data
   */
  async createPost(postData: Partial<BlogPost>): Promise<{ success: boolean; data: BlogPost | null; error?: string }> {
    try {
      const response = await EnhancedApiService.post<BlogPost>('/api/blogs', postData);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      this.logger.error('Error creating blog post:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to create blog post',
      };
    }
  }

  /**
   * Update an existing blog post
   * @param id Blog post ID
   * @param postData Updated blog post data
   */
  async updatePost(id: string, postData: Partial<BlogPost>): Promise<{ success: boolean; data: BlogPost | null; error?: string }> {
    try {
      const response = await EnhancedApiService.put<BlogPost>(`/api/blogs/${id}`, postData);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      this.logger.error(`Error updating blog post with ID ${id}:`, error);
      return {
        success: false,
        data: null,
        error: 'Failed to update blog post',
      };
    }
  }

  /**
   * Delete a blog post by its ID
   * @param id Blog post ID
   */
  async deletePost(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await EnhancedApiService.delete(`/api/blogs/${id}`);
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error deleting blog post with ID ${id}:`, error);
      return {
        success: false,
        error: 'Failed to delete blog post',
      };
    }
  }

  /**
   * Get all blog categories
   */
  async getCategories(): Promise<{ success: boolean; data: BlogCategory[] | null; error?: string }> {
    try {
      const response = await EnhancedApiService.get<BlogCategory[]>('/api/blog-categories');
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      this.logger.error('Error fetching blog categories:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to fetch blog categories',
      };
    }
  }

  /**
   * Get all blog tags
   */
  async getTags(): Promise<{ success: boolean; data: BlogTag[] | null; error?: string }> {
    try {
      const response = await EnhancedApiService.get<BlogTag[]>('/api/blog-tags');
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      this.logger.error('Error fetching blog tags:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to fetch blog tags',
      };
    }
  }

  /**
   * Get a blog post by its ID
   * @param id Blog post ID
   */
  async getPost(id: string): Promise<{ success: boolean; data: BlogPost | null; error?: string }> {
    try {
      const response = await EnhancedApiService.get<BlogPost>(`/api/blogs/${id}`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      this.logger.error('Error fetching blog post:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to fetch blog post'
      };
    }
  }

  /**
   * Upload an image for blog posts
   * @param file Image file to upload
   */
  async uploadImage(file: File): Promise<{ success: boolean; data: BlogMedia; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await EnhancedApiService.post<BlogMedia>('/api/blog-media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      this.logger.error('Error uploading image:', error);
      return {
        success: false,
        data: {
          id: 'error',
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          url: '',
          uploadDate: new Date().toISOString(),
        },
        error: 'Failed to upload image'
      };
    }
  }

  /**
   * Add a comment to a blog post
   * @param postId Blog post ID
   * @param comment Comment data
   */
  async addComment(postId: string, comment: Partial<BlogComment>): Promise<{ success: boolean; data: BlogComment | null; error?: string }> {
    try {
      const response = await EnhancedApiService.post<BlogComment>(`/api/blogs/${postId}/comments`, comment);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      this.logger.error('Error adding comment:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to add comment'
      };
    }
  }

  /**
   * Get comments for a blog post
   * @param postId Blog post ID
   */
  async getComments(postId: string): Promise<{ success: boolean; data: BlogComment[] | null; error?: string }> {
    try {
      const response = await EnhancedApiService.get<BlogComment[]>(`/api/blogs/${postId}/comments`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      this.logger.error('Error fetching comments:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to fetch comments'
      };
    }
  }

  /**
   * Create a new blog category
   * @param category Category data
   */
  async createCategory(category: Partial<BlogCategory>): Promise<{ success: boolean; data: BlogCategory | null; error?: string }> {
    try {
      const response = await EnhancedApiService.post<BlogCategory>('/api/blog-categories', category);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      this.logger.error('Error creating category:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to create category'
      };
    }
  }

  /**
   * Update a blog category
   * @param id Category ID
   * @param category Updated category data
   */
  async updateCategory(id: string, category: Partial<BlogCategory>): Promise<{ success: boolean; data: BlogCategory | null; error?: string }> {
    try {
      const response = await EnhancedApiService.put<BlogCategory>(`/api/blog-categories/${id}`, category);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      this.logger.error('Error updating category:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to update category'
      };
    }
  }

  /**
   * Delete a blog category
   * @param id Category ID
   */
  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await EnhancedApiService.delete(`/api/blog-categories/${id}`);
      return {
        success: true
      };
    } catch (error) {
      this.logger.error('Error deleting category:', error);
      return {
        success: false,
        error: 'Failed to delete category'
      };
    }
  }

  /**
   * Create a new blog tag
   * @param tag Tag data
   */
  async createTag(tag: Partial<BlogTag>): Promise<{ success: boolean; data: BlogTag | null; error?: string }> {
    try {
      const response = await EnhancedApiService.post<BlogTag>('/api/blog-tags', tag);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      this.logger.error('Error creating tag:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to create tag'
      };
    }
  }

  /**
   * Update a blog tag
   * @param id Tag ID
   * @param tag Updated tag data
   */
  async updateTag(id: string, tag: Partial<BlogTag>): Promise<{ success: boolean; data: BlogTag | null; error?: string }> {
    try {
      const response = await EnhancedApiService.put<BlogTag>(`/api/blog-tags/${id}`, tag);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      this.logger.error('Error updating tag:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to update tag'
      };
    }
  }

  /**
   * Delete a blog tag
   * @param id Tag ID
   */
  async deleteTag(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await EnhancedApiService.delete(`/api/blog-tags/${id}`);
      return {
        success: true
      };
    } catch (error) {
      this.logger.error('Error deleting tag:', error);
      return {
        success: false,
        error: 'Failed to delete tag'
      };
    }
  }
}

// Initialize and register with the service registry
const blogService = BlogService.getInstance();
ServiceRegistry.register('blog', blogService);

export default BlogService.getInstance();
