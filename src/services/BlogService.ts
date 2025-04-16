
import EnhancedApiService, { ApiResponse, PaginatedData, PaginationOptions } from './EnhancedApiService';
import LoggingService from './LoggingService';
import { BlogPost, BlogComment, BlogCategory, BlogTag } from '@/types/Blog';

class BlogService {
  /**
   * Get all blog posts with pagination and filters
   */
  async getPosts(options: PaginationOptions = {}): Promise<ApiResponse<PaginatedData<BlogPost>>> {
    try {
      return await EnhancedApiService.getPaginated<BlogPost>(
        '/api/blog/posts',
        options
      );
    } catch (error) {
      LoggingService.error(
        "blog", 
        "fetch_posts_failed", 
        "Failed to fetch blog posts", 
        { error, options }
      );
      throw error;
    }
  }

  /**
   * Get a single blog post by ID
   */
  async getPost(id: string): Promise<ApiResponse<BlogPost>> {
    try {
      return await EnhancedApiService.get<BlogPost>(
        `/api/blog/posts/${id}`
      );
    } catch (error) {
      LoggingService.error(
        "blog", 
        "fetch_post_failed", 
        `Failed to fetch blog post with ID: ${id}`, 
        { error }
      );
      throw error;
    }
  }

  /**
   * Create a new blog post
   */
  async createPost(postData: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    try {
      return await EnhancedApiService.post<BlogPost>(
        '/api/blog/posts',
        postData
      );
    } catch (error) {
      LoggingService.error(
        "blog", 
        "create_post_failed", 
        "Failed to create blog post", 
        { error, postData }
      );
      throw error;
    }
  }

  /**
   * Update an existing blog post
   */
  async updatePost(id: string, postData: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    try {
      return await EnhancedApiService.put<BlogPost>(
        `/api/blog/posts/${id}`,
        postData
      );
    } catch (error) {
      LoggingService.error(
        "blog", 
        "update_post_failed", 
        `Failed to update blog post with ID: ${id}`, 
        { error, postData }
      );
      throw error;
    }
  }

  /**
   * Delete a blog post
   */
  async deletePost(id: string): Promise<ApiResponse<void>> {
    try {
      return await EnhancedApiService.delete<void>(
        `/api/blog/posts/${id}`
      );
    } catch (error) {
      LoggingService.error(
        "blog", 
        "delete_post_failed", 
        `Failed to delete blog post with ID: ${id}`, 
        { error }
      );
      throw error;
    }
  }

  /**
   * Upload cover image for blog post
   */
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      return await EnhancedApiService.request<{ url: string }>(
        '/api/blog/uploads',
        {
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    } catch (error) {
      LoggingService.error(
        "blog", 
        "upload_image_failed", 
        "Failed to upload blog image", 
        { error, fileName: file.name }
      );
      throw error;
    }
  }

  /**
   * Get comments for a blog post
   */
  async getComments(postId: string, options: PaginationOptions = {}): Promise<ApiResponse<PaginatedData<BlogComment>>> {
    try {
      return await EnhancedApiService.getPaginated<BlogComment>(
        `/api/blog/posts/${postId}/comments`,
        options
      );
    } catch (error) {
      LoggingService.error(
        "blog", 
        "fetch_comments_failed", 
        `Failed to fetch comments for post ID: ${postId}`, 
        { error, options }
      );
      throw error;
    }
  }

  /**
   * Add a comment to a blog post
   */
  async addComment(postId: string, comment: Partial<BlogComment>): Promise<ApiResponse<BlogComment>> {
    try {
      return await EnhancedApiService.post<BlogComment>(
        `/api/blog/posts/${postId}/comments`,
        comment
      );
    } catch (error) {
      LoggingService.error(
        "blog", 
        "add_comment_failed", 
        `Failed to add comment to post ID: ${postId}`, 
        { error, comment }
      );
      throw error;
    }
  }

  /**
   * Get blog categories
   */
  async getCategories(): Promise<ApiResponse<BlogCategory[]>> {
    try {
      return await EnhancedApiService.get<BlogCategory[]>(
        '/api/blog/categories'
      );
    } catch (error) {
      LoggingService.error(
        "blog", 
        "fetch_categories_failed", 
        "Failed to fetch blog categories", 
        { error }
      );
      throw error;
    }
  }

  /**
   * Get blog tags
   */
  async getTags(): Promise<ApiResponse<BlogTag[]>> {
    try {
      return await EnhancedApiService.get<BlogTag[]>(
        '/api/blog/tags'
      );
    } catch (error) {
      LoggingService.error(
        "blog", 
        "fetch_tags_failed", 
        "Failed to fetch blog tags", 
        { error }
      );
      throw error;
    }
  }
}

export default new BlogService();
