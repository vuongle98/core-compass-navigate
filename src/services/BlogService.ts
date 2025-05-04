
import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";
import { BlogPost, BlogCategory, BlogTag } from "@/types/Blog";
import ServiceRegistry from "./ServiceRegistry";

export interface BlogSearchParams {
  search?: string;
  category?: string;
  tags?: string[];
  author?: string;
  status?: "draft" | "published" | "archived";
  fromDate?: string;
  toDate?: string;
}

/**
 * Blog Service for managing blog related operations
 */
class BlogService {
  private static instance: BlogService;
  private readonly baseEndpoint = '/api/blogs';
  
  private constructor() {
    LoggingService.info('blog', 'service_initialized', 'Blog service initialized');
  }
  
  public static getInstance(): BlogService {
    if (!BlogService.instance) {
      BlogService.instance = new BlogService();
    }
    return BlogService.instance;
  }
  
  /**
   * Get all blog posts with pagination and filtering
   */
  public async getPosts(page: number, pageSize: number, params?: BlogSearchParams) {
    LoggingService.info('blog', 'fetch_posts', 'Fetching blog posts', { page, pageSize, params });
    
    try {
      const result = await EnhancedApiService.getPaginated<BlogPost>(
        this.baseEndpoint,
        {
          page,
          pageSize,
          filter: params
        }
      );
      
      return result.data;
    } catch (error) {
      LoggingService.error('blog', 'fetch_posts_failed', 'Failed to fetch blog posts', { error });
      throw error;
    }
  }
  
  /**
   * Get a single blog post by ID
   */
  public async getPost(id: string) {
    LoggingService.info('blog', 'fetch_post', 'Fetching blog post', { id });
    
    try {
      const result = await EnhancedApiService.get<BlogPost>(`${this.baseEndpoint}/${id}`);
      return result.data;
    } catch (error) {
      LoggingService.error('blog', 'fetch_post_failed', 'Failed to fetch blog post', { id, error });
      throw error;
    }
  }
  
  /**
   * Create a new blog post
   */
  public async createPost(post: Partial<BlogPost>) {
    LoggingService.info('blog', 'create_post', 'Creating blog post', { title: post.title });
    
    try {
      const result = await EnhancedApiService.post<BlogPost>(this.baseEndpoint, post);
      LoggingService.info('blog', 'create_post_success', 'Blog post created successfully', { postId: result.data.id });
      return result.data;
    } catch (error) {
      LoggingService.error('blog', 'create_post_failed', 'Failed to create blog post', { error });
      throw error;
    }
  }
  
  /**
   * Update an existing blog post
   */
  public async updatePost(id: string, post: Partial<BlogPost>) {
    LoggingService.info('blog', 'update_post', 'Updating blog post', { id });
    
    try {
      const result = await EnhancedApiService.put<BlogPost>(`${this.baseEndpoint}/${id}`, post);
      LoggingService.info('blog', 'update_post_success', 'Blog post updated successfully', { id });
      return result.data;
    } catch (error) {
      LoggingService.error('blog', 'update_post_failed', 'Failed to update blog post', { id, error });
      throw error;
    }
  }
  
  /**
   * Delete a blog post
   */
  public async deletePost(id: string) {
    LoggingService.info('blog', 'delete_post', 'Deleting blog post', { id });
    
    try {
      const result = await EnhancedApiService.delete<{ success: boolean }>(`${this.baseEndpoint}/${id}`);
      LoggingService.info('blog', 'delete_post_success', 'Blog post deleted successfully', { id });
      return result.data;
    } catch (error) {
      LoggingService.error('blog', 'delete_post_failed', 'Failed to delete blog post', { id, error });
      throw error;
    }
  }
  
  /**
   * Get blog categories
   */
  public async getCategories() {
    LoggingService.info('blog', 'fetch_categories', 'Fetching blog categories');
    
    try {
      const result = await EnhancedApiService.get<BlogCategory[]>(`${this.baseEndpoint}/categories`);
      return result.data;
    } catch (error) {
      LoggingService.error('blog', 'fetch_categories_failed', 'Failed to fetch blog categories', { error });
      throw error;
    }
  }
  
  /**
   * Get blog tags
   */
  public async getTags() {
    LoggingService.info('blog', 'fetch_tags', 'Fetching blog tags');
    
    try {
      const result = await EnhancedApiService.get<BlogTag[]>(`${this.baseEndpoint}/tags`);
      return result.data;
    } catch (error) {
      LoggingService.error('blog', 'fetch_tags_failed', 'Failed to fetch blog tags', { error });
      throw error;
    }
  }
  
  /**
   * Get popular blog posts
   */
  public async getPopularPosts(limit = 5) {
    LoggingService.info('blog', 'fetch_popular_posts', 'Fetching popular blog posts', { limit });
    
    try {
      const result = await EnhancedApiService.get<BlogPost[]>(`${this.baseEndpoint}/popular`, { limit });
      return result.data;
    } catch (error) {
      LoggingService.error('blog', 'fetch_popular_posts_failed', 'Failed to fetch popular blog posts', { error });
      throw error;
    }
  }
  
  /**
   * Search blog posts
   */
  public async searchPosts(query: string, limit = 10) {
    LoggingService.info('blog', 'search_posts', 'Searching blog posts', { query, limit });
    
    try {
      const result = await EnhancedApiService.get<BlogPost[]>(`${this.baseEndpoint}/search`, { query, limit });
      return result.data;
    } catch (error) {
      LoggingService.error('blog', 'search_posts_failed', 'Failed to search blog posts', { query, error });
      throw error;
    }
  }
}

// Initialize and register with the service registry
const blogService = BlogService.getInstance();
ServiceRegistry.getInstance().register('blog', blogService);

export default blogService;
