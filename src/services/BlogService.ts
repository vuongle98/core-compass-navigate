
import EnhancedApiService from './EnhancedApiService';
import { Blog, BlogPost, BlogCategory, BlogTag, BlogComment, BlogServiceResponse, ImageUploadResponse } from '@/types/Blog';
import LoggingService from './LoggingService';

/**
 * Service for blog related operations
 */
class BlogService {
  private static API_ENDPOINT = '/api/blogs';
  
  /**
   * Get a paginated list of blog posts
   */
  static async getPosts(params?: any) {
    try {
      LoggingService.info('blog_service', 'get_posts', 'Fetching blog posts');
      return await EnhancedApiService.getPaginated<Blog>(this.API_ENDPOINT, {}, params);
    } catch (error) {
      LoggingService.error('blog_service', 'get_posts_failed', 'Failed to fetch blog posts', error);
      throw error;
    }
  }

  /**
   * Get a single blog post by ID
   */
  static async getPost(id: string): Promise<BlogServiceResponse<BlogPost>> {
    try {
      LoggingService.info('blog_service', 'get_post', `Fetching blog post ${id}`);
      const response = await EnhancedApiService.get<BlogPost>(`${this.API_ENDPOINT}/${id}`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'get_post_failed', `Failed to fetch blog post ${id}`, error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Create a new blog post
   */
  static async createPost(data: Partial<BlogPost>): Promise<BlogServiceResponse<BlogPost>> {
    try {
      LoggingService.info('blog_service', 'create_post', 'Creating new blog post');
      const response = await EnhancedApiService.post<BlogPost>(this.API_ENDPOINT, data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'create_post_failed', 'Failed to create blog post', error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Update an existing blog post
   */
  static async updatePost(id: string, data: Partial<BlogPost>): Promise<BlogServiceResponse<BlogPost>> {
    try {
      LoggingService.info('blog_service', 'update_post', `Updating blog post ${id}`);
      const response = await EnhancedApiService.put<BlogPost>(`${this.API_ENDPOINT}/${id}`, data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'update_post_failed', `Failed to update blog post ${id}`, error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Delete a blog post
   */
  static async deletePost(id: string): Promise<BlogServiceResponse<void>> {
    try {
      LoggingService.info('blog_service', 'delete_post', `Deleting blog post ${id}`);
      await EnhancedApiService.delete(`${this.API_ENDPOINT}/${id}`);
      return {
        success: true
      };
    } catch (error) {
      LoggingService.error('blog_service', 'delete_post_failed', `Failed to delete blog post ${id}`, error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Get categories
   */
  static async getCategories(params?: any): Promise<BlogServiceResponse<BlogCategory[]>> {
    try {
      LoggingService.info('blog_service', 'get_categories', 'Fetching blog categories');
      const response = await EnhancedApiService.get<BlogCategory[]>(`${this.API_ENDPOINT}/categories`, params);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'get_categories_failed', 'Failed to fetch blog categories', error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Create a new category
   */
  static async createCategory(data: Partial<BlogCategory>): Promise<BlogServiceResponse<BlogCategory>> {
    try {
      LoggingService.info('blog_service', 'create_category', 'Creating new blog category');
      const response = await EnhancedApiService.post<BlogCategory>(`${this.API_ENDPOINT}/categories`, data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'create_category_failed', 'Failed to create blog category', error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Update an existing category
   */
  static async updateCategory(id: string, data: Partial<BlogCategory>): Promise<BlogServiceResponse<BlogCategory>> {
    try {
      LoggingService.info('blog_service', 'update_category', `Updating blog category ${id}`);
      const response = await EnhancedApiService.put<BlogCategory>(`${this.API_ENDPOINT}/categories/${id}`, data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'update_category_failed', `Failed to update blog category ${id}`, error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Delete a category
   */
  static async deleteCategory(id: string): Promise<BlogServiceResponse<void>> {
    try {
      LoggingService.info('blog_service', 'delete_category', `Deleting blog category ${id}`);
      await EnhancedApiService.delete(`${this.API_ENDPOINT}/categories/${id}`);
      return {
        success: true
      };
    } catch (error) {
      LoggingService.error('blog_service', 'delete_category_failed', `Failed to delete blog category ${id}`, error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Get tags
   */
  static async getTags(params?: any): Promise<BlogServiceResponse<BlogTag[]>> {
    try {
      LoggingService.info('blog_service', 'get_tags', 'Fetching blog tags');
      const response = await EnhancedApiService.get<BlogTag[]>(`${this.API_ENDPOINT}/tags`, params);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'get_tags_failed', 'Failed to fetch blog tags', error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Create a new tag
   */
  static async createTag(data: Partial<BlogTag>): Promise<BlogServiceResponse<BlogTag>> {
    try {
      LoggingService.info('blog_service', 'create_tag', 'Creating new blog tag');
      const response = await EnhancedApiService.post<BlogTag>(`${this.API_ENDPOINT}/tags`, data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'create_tag_failed', 'Failed to create blog tag', error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Update an existing tag
   */
  static async updateTag(id: string, data: Partial<BlogTag>): Promise<BlogServiceResponse<BlogTag>> {
    try {
      LoggingService.info('blog_service', 'update_tag', `Updating blog tag ${id}`);
      const response = await EnhancedApiService.put<BlogTag>(`${this.API_ENDPOINT}/tags/${id}`, data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'update_tag_failed', `Failed to update blog tag ${id}`, error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Delete a tag
   */
  static async deleteTag(id: string): Promise<BlogServiceResponse<void>> {
    try {
      LoggingService.info('blog_service', 'delete_tag', `Deleting blog tag ${id}`);
      await EnhancedApiService.delete(`${this.API_ENDPOINT}/tags/${id}`);
      return {
        success: true
      };
    } catch (error) {
      LoggingService.error('blog_service', 'delete_tag_failed', `Failed to delete blog tag ${id}`, error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Get comments for a blog post
   */
  static async getComments(postId: string, params?: any): Promise<BlogServiceResponse<BlogComment[]>> {
    try {
      LoggingService.info('blog_service', 'get_comments', `Fetching comments for blog post ${postId}`);
      const response = await EnhancedApiService.get<BlogComment[]>(`${this.API_ENDPOINT}/${postId}/comments`, params);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'get_comments_failed', `Failed to fetch comments for blog post ${postId}`, error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Add a comment to a blog post
   */
  static async addComment(postId: string, data: Partial<BlogComment>): Promise<BlogServiceResponse<BlogComment>> {
    try {
      LoggingService.info('blog_service', 'add_comment', `Adding comment to blog post ${postId}`);
      const response = await EnhancedApiService.post<BlogComment>(`${this.API_ENDPOINT}/${postId}/comments`, data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'add_comment_failed', `Failed to add comment to blog post ${postId}`, error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Upload an image for a blog post
   */
  static async uploadImage(file: File): Promise<BlogServiceResponse<ImageUploadResponse>> {
    try {
      LoggingService.info('blog_service', 'upload_image', 'Uploading blog image');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await EnhancedApiService.post<ImageUploadResponse>(`${this.API_ENDPOINT}/upload`, formData, {
        'Content-Type': 'multipart/form-data'
      });
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      LoggingService.error('blog_service', 'upload_image_failed', 'Failed to upload blog image', error);
      return {
        success: false,
        error
      };
    }
  }
}

export default BlogService;
