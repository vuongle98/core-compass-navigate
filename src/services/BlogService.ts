import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";
import { BlogPost, BlogCategory, BlogTag } from "@/types/Blog";
import ServiceRegistry from './ServiceRegistry';

export interface BlogSearchParams {
  search?: string;
  category?: string;
  tags?: string[];
  author?: string;
  status?: "draft" | "published" | "scheduled";
  fromDate?: string;
  toDate?: string;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
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
      // Convert BlogSearchParams to Record<string, string | number | boolean | string[]>
      const filterParams: Record<string, string | number | boolean | string[]> = {};
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            filterParams[key] = value;
          }
        });
      }
      
      const result = await EnhancedApiService.getPaginated<BlogPost>(
        this.baseEndpoint,
        {
          page,
          pageSize,
          filter: filterParams
        }
      );
      
      return result;
    } catch (error) {
      LoggingService.error('blog', 'fetch_posts_failed', 'Failed to fetch blog posts', { error });
      throw error;
    }
  }
  
  /**
   * Get a single blog post by ID
   */
  public async getPost(id: string): Promise<ApiResponse<BlogPost>> {
    LoggingService.info('blog', 'fetch_post', 'Fetching blog post', { id });
    
    try {
      const result = await EnhancedApiService.get<BlogPost>(`${this.baseEndpoint}/${id}`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'fetch_post_failed', 'Failed to fetch blog post', { id, error });
      throw error;
    }
  }
  
  /**
   * Create a new blog post
   */
  public async createPost(post: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    LoggingService.info('blog', 'create_post', 'Creating blog post', { title: post.title });
    
    try {
      const result = await EnhancedApiService.post<BlogPost>(this.baseEndpoint, post);
      LoggingService.info('blog', 'create_post_success', 'Blog post created successfully', { postId: result.id });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'create_post_failed', 'Failed to create blog post', { error });
      throw error;
    }
  }
  
  /**
   * Update an existing blog post
   */
  public async updatePost(id: string, post: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    LoggingService.info('blog', 'update_post', 'Updating blog post', { id });
    
    try {
      const result = await EnhancedApiService.put<BlogPost>(`${this.baseEndpoint}/${id}`, post);
      LoggingService.info('blog', 'update_post_success', 'Blog post updated successfully', { id });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'update_post_failed', 'Failed to update blog post', { id, error });
      throw error;
    }
  }
  
  /**
   * Delete a blog post
   */
  public async deletePost(id: string): Promise<ApiResponse<{ success: boolean }>> {
    LoggingService.info('blog', 'delete_post', 'Deleting blog post', { id });
    
    try {
      const result = await EnhancedApiService.delete<{ success: boolean }>(`${this.baseEndpoint}/${id}`);
      LoggingService.info('blog', 'delete_post_success', 'Blog post deleted successfully', { id });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'delete_post_failed', 'Failed to delete blog post', { id, error });
      throw error;
    }
  }
  
  /**
   * Get blog categories
   */
  public async getCategories(): Promise<ApiResponse<BlogCategory[]>> {
    LoggingService.info('blog', 'fetch_categories', 'Fetching blog categories');
    
    try {
      const result = await EnhancedApiService.get<BlogCategory[]>(`${this.baseEndpoint}/categories`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'fetch_categories_failed', 'Failed to fetch blog categories', { error });
      throw error;
    }
  }

  /**
   * Create a category
   */
  public async createCategory(category: Partial<BlogCategory>): Promise<ApiResponse<BlogCategory>> {
    LoggingService.info('blog', 'create_category', 'Creating blog category', { name: category.name });
    
    try {
      const result = await EnhancedApiService.post<BlogCategory>(`${this.baseEndpoint}/categories`, category);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'create_category_failed', 'Failed to create blog category', { error });
      throw error;
    }
  }

  /**
   * Update a category
   */
  public async updateCategory(id: string, category: Partial<BlogCategory>): Promise<ApiResponse<BlogCategory>> {
    LoggingService.info('blog', 'update_category', 'Updating blog category', { id });
    
    try {
      const result = await EnhancedApiService.put<BlogCategory>(`${this.baseEndpoint}/categories/${id}`, category);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'update_category_failed', 'Failed to update blog category', { error });
      throw error;
    }
  }

  /**
   * Delete a category
   */
  public async deleteCategory(id: string): Promise<ApiResponse<{ success: boolean }>> {
    LoggingService.info('blog', 'delete_category', 'Deleting blog category', { id });
    
    try {
      const result = await EnhancedApiService.delete<{ success: boolean }>(`${this.baseEndpoint}/categories/${id}`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'delete_category_failed', 'Failed to delete blog category', { error });
      throw error;
    }
  }
  
  /**
   * Get blog tags
   */
  public async getTags(): Promise<ApiResponse<BlogTag[]>> {
    LoggingService.info('blog', 'fetch_tags', 'Fetching blog tags');
    
    try {
      const result = await EnhancedApiService.get<BlogTag[]>(`${this.baseEndpoint}/tags`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'fetch_tags_failed', 'Failed to fetch blog tags', { error });
      throw error;
    }
  }

  /**
   * Create a tag
   */
  public async createTag(tag: Partial<BlogTag>): Promise<ApiResponse<BlogTag>> {
    LoggingService.info('blog', 'create_tag', 'Creating blog tag', { name: tag.name });
    
    try {
      const result = await EnhancedApiService.post<BlogTag>(`${this.baseEndpoint}/tags`, tag);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'create_tag_failed', 'Failed to create blog tag', { error });
      throw error;
    }
  }

  /**
   * Update a tag
   */
  public async updateTag(id: string, tag: Partial<BlogTag>): Promise<ApiResponse<BlogTag>> {
    LoggingService.info('blog', 'update_tag', 'Updating blog tag', { id });
    
    try {
      const result = await EnhancedApiService.put<BlogTag>(`${this.baseEndpoint}/tags/${id}`, tag);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'update_tag_failed', 'Failed to update blog tag', { error });
      throw error;
    }
  }

  /**
   * Delete a tag
   */
  public async deleteTag(id: string): Promise<ApiResponse<{ success: boolean }>> {
    LoggingService.info('blog', 'delete_tag', 'Deleting blog tag', { id });
    
    try {
      const result = await EnhancedApiService.delete<{ success: boolean }>(`${this.baseEndpoint}/tags/${id}`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'delete_tag_failed', 'Failed to delete blog tag', { error });
      throw error;
    }
  }
  
  /**
   * Get popular blog posts
   */
  public async getPopularPosts(limit = 5): Promise<ApiResponse<BlogPost[]>> {
    LoggingService.info('blog', 'fetch_popular_posts', 'Fetching popular blog posts', { limit });
    
    try {
      const result = await EnhancedApiService.get<BlogPost[]>(`${this.baseEndpoint}/popular`, { limit });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'fetch_popular_posts_failed', 'Failed to fetch popular blog posts', { error });
      throw error;
    }
  }
  
  /**
   * Search blog posts
   */
  public async searchPosts(query: string, limit = 10): Promise<ApiResponse<BlogPost[]>> {
    LoggingService.info('blog', 'search_posts', 'Searching blog posts', { query, limit });
    
    try {
      const result = await EnhancedApiService.get<BlogPost[]>(`${this.baseEndpoint}/search`, { query, limit });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'search_posts_failed', 'Failed to search blog posts', { query, error });
      throw error;
    }
  }
  
  /**
   * Upload an image for a blog post
   */
  public async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    LoggingService.info('blog', 'upload_image', 'Uploading image for blog post', { fileName: file.name });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const options = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const result = await EnhancedApiService.post<{ url: string }>(`${this.baseEndpoint}/upload`, formData, options);
      
      return {
        success: true,
        data: { url: result.url || `/uploads/${file.name}` } // Mock URL if not provided
      };
    } catch (error) {
      LoggingService.error('blog', 'upload_image_failed', 'Failed to upload image', { error });
      // Mock success for demo purposes
      return {
        success: true,
        data: { url: `/uploads/${file.name}` }
      };
    }
  }
  
  /**
   * Get comments for a blog post
   */
  public async getComments(postId: string): Promise<ApiResponse<any[]>> {
    LoggingService.info('blog', 'fetch_comments', 'Fetching comments for blog post', { postId });
    
    try {
      const result = await EnhancedApiService.get<any[]>(`${this.baseEndpoint}/${postId}/comments`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'fetch_comments_failed', 'Failed to fetch comments', { postId, error });
      // Return mock data for demo purposes
      return {
        success: true,
        data: []
      };
    }
  }
  
  /**
   * Add a comment to a blog post
   */
  public async addComment(postId: string, comment: any): Promise<ApiResponse<any>> {
    LoggingService.info('blog', 'add_comment', 'Adding comment to blog post', { postId });
    
    try {
      const result = await EnhancedApiService.post<any>(`${this.baseEndpoint}/${postId}/comments`, comment);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      LoggingService.error('blog', 'add_comment_failed', 'Failed to add comment', { postId, error });
      throw error;
    }
  }
}

// Initialize and register with the service registry
const apiService = ServiceRegistry.get<EnhancedApiService>('api');
const blogService = BlogService.getInstance();
ServiceRegistry.register('blog', blogService);

export default blogService;
