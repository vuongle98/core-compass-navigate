
import axios from "axios";
import { BlogPost, BlogCategory, BlogTag } from "@/types/Blog";
import LoggingService from "@/services/LoggingService";

/**
 * Service for handling blog-related operations
 */
class BlogService {
  private static instance: BlogService | null = null;

  private constructor() {}

  public static getInstance(): BlogService {
    if (!BlogService.instance) {
      BlogService.instance = new BlogService();
    }
    return BlogService.instance;
  }

  // Blog Post methods
  async getPost(id: string): Promise<any> {
    try {
      const response = await axios.get(`/api/blog/${id}`);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'get_post_failed', 'Failed to get post', error);
      throw error;
    }
  }

  async createPost(post: Partial<BlogPost>): Promise<any> {
    try {
      const response = await axios.post('/api/blog', post);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'create_post_failed', 'Failed to create post', error);
      throw error;
    }
  }

  async updatePost(id: string, post: Partial<BlogPost>): Promise<any> {
    try {
      const response = await axios.put(`/api/blog/${id}`, post);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'update_post_failed', 'Failed to update post', error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<any> {
    try {
      const response = await axios.delete(`/api/blog/${id}`);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'delete_post_failed', 'Failed to delete post', error);
      throw error;
    }
  }

  // Image upload method
  async uploadImage(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/blog/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      LoggingService.info('blog', 'image_upload_success', 'Image uploaded successfully');
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'image_upload_failed', 'Failed to upload image', error);
      throw new Error('Failed to upload image');
    }
  }

  // Category methods
  async getCategories(): Promise<any> {
    try {
      const response = await axios.get('/api/blog/categories');
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'get_categories_failed', 'Failed to get categories', error);
      throw error;
    }
  }

  async createCategory(category: Partial<BlogCategory>): Promise<any> {
    try {
      const response = await axios.post('/api/blog/categories', category);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'create_category_failed', 'Failed to create category', error);
      throw error;
    }
  }

  async updateCategory(id: string, category: Partial<BlogCategory>): Promise<any> {
    try {
      const response = await axios.put(`/api/blog/categories/${id}`, category);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'update_category_failed', 'Failed to update category', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<any> {
    try {
      const response = await axios.delete(`/api/blog/categories/${id}`);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'delete_category_failed', 'Failed to delete category', error);
      throw error;
    }
  }

  // Tag methods
  async getTags(): Promise<any> {
    try {
      const response = await axios.get('/api/blog/tags');
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'get_tags_failed', 'Failed to get tags', error);
      throw error;
    }
  }

  async createTag(tag: Partial<BlogTag>): Promise<any> {
    try {
      const response = await axios.post('/api/blog/tags', tag);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'create_tag_failed', 'Failed to create tag', error);
      throw error;
    }
  }

  async updateTag(id: string, tag: Partial<BlogTag>): Promise<any> {
    try {
      const response = await axios.put(`/api/blog/tags/${id}`, tag);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'update_tag_failed', 'Failed to update tag', error);
      throw error;
    }
  }

  async deleteTag(id: string): Promise<any> {
    try {
      const response = await axios.delete(`/api/blog/tags/${id}`);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'delete_tag_failed', 'Failed to delete tag', error);
      throw error;
    }
  }

  // Comment methods
  async getComments(blogId: string): Promise<any> {
    try {
      const response = await axios.get(`/api/blog/${blogId}/comments`);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'get_comments_failed', 'Failed to get comments', error);
      throw error;
    }
  }

  async addComment(blogId: string, comment: any): Promise<any> {
    try {
      const response = await axios.post(`/api/blog/${blogId}/comments`, comment);
      return response.data;
    } catch (error) {
      LoggingService.error('blog', 'add_comment_failed', 'Failed to add comment', error);
      throw error;
    }
  }

  // Static methods that delegate to instance methods
  public static async getPost(id: string): Promise<any> {
    return BlogService.getInstance().getPost(id);
  }

  public static async createPost(post: Partial<BlogPost>): Promise<any> {
    return BlogService.getInstance().createPost(post);
  }

  public static async updatePost(id: string, post: Partial<BlogPost>): Promise<any> {
    return BlogService.getInstance().updatePost(id, post);
  }

  public static async deletePost(id: string): Promise<any> {
    return BlogService.getInstance().deletePost(id);
  }

  public static async uploadImage(file: File): Promise<any> {
    return BlogService.getInstance().uploadImage(file);
  }

  public static async getCategories(): Promise<any> {
    return BlogService.getInstance().getCategories();
  }

  public static async createCategory(category: Partial<BlogCategory>): Promise<any> {
    return BlogService.getInstance().createCategory(category);
  }

  public static async updateCategory(id: string, category: Partial<BlogCategory>): Promise<any> {
    return BlogService.getInstance().updateCategory(id, category);
  }

  public static async deleteCategory(id: string): Promise<any> {
    return BlogService.getInstance().deleteCategory(id);
  }

  public static async getTags(): Promise<any> {
    return BlogService.getInstance().getTags();
  }

  public static async createTag(tag: Partial<BlogTag>): Promise<any> {
    return BlogService.getInstance().createTag(tag);
  }

  public static async updateTag(id: string, tag: Partial<BlogTag>): Promise<any> {
    return BlogService.getInstance().updateTag(id, tag);
  }

  public static async deleteTag(id: string): Promise<any> {
    return BlogService.getInstance().deleteTag(id);
  }

  public static async getComments(blogId: string): Promise<any> {
    return BlogService.getInstance().getComments(blogId);
  }

  public static async addComment(blogId: string, comment: any): Promise<any> {
    return BlogService.getInstance().addComment(blogId, comment);
  }
}

export default BlogService;
