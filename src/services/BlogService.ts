import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";
import { BlogPost, BlogCategory, BlogTag } from "@/types/Blog";
import { ServiceRegistry } from "./ServiceRegistry";

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
  async createPost(postData: BlogPost): Promise<{ success: boolean; data: BlogPost | null; error?: string }> {
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
  async updatePost(id: string, postData: BlogPost): Promise<{ success: boolean; data: BlogPost | null; error?: string }> {
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
}

// Initialize and register with the service registry
const apiService = ServiceRegistry.get('api');
const blogService = BlogService.getInstance();
ServiceRegistry.register('blog', blogService);

export default BlogService.getInstance();
