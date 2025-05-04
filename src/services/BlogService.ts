import axios from "axios";
import LoggingService from "./LoggingService";
import { BlogPost, BlogCategory, BlogTag } from "@/types/Blog";
import ServiceRegistry from "./ServiceRegistry";

/**
 * Service for handling blog-related operations
 */
class BlogService {
  private static instance: BlogService;
  private logger = LoggingService.getInstance();

  private constructor() {}

  static getInstance(): BlogService {
    if (!BlogService.instance) {
      BlogService.instance = new BlogService();
    }
    return BlogService.instance;
  }

  // Existing methods...
  
  // Add missing methods for blog image uploads
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/blog/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      this.logger.info('Image uploaded successfully');
      return response.data.url;
    } catch (error) {
      this.logger.error('Failed to upload image', error);
      throw new Error('Failed to upload image');
    }
  }

  // Add missing methods for categories
  async createCategory(category: Partial<BlogCategory>): Promise<BlogCategory> {
    try {
      const response = await axios.post('/api/blog/categories', category);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create category', error);
      throw error;
    }
  }

  async updateCategory(id: string, category: Partial<BlogCategory>): Promise<BlogCategory> {
    try {
      const response = await axios.put(`/api/blog/categories/${id}`, category);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update category', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await axios.delete(`/api/blog/categories/${id}`);
    } catch (error) {
      this.logger.error('Failed to delete category', error);
      throw error;
    }
  }

  // Add missing methods for tags
  async createTag(tag: Partial<BlogTag>): Promise<BlogTag> {
    try {
      const response = await axios.post('/api/blog/tags', tag);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create tag', error);
      throw error;
    }
  }

  async updateTag(id: string, tag: Partial<BlogTag>): Promise<BlogTag> {
    try {
      const response = await axios.put(`/api/blog/tags/${id}`, tag);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update tag', error);
      throw error;
    }
  }

  async deleteTag(id: string): Promise<void> {
    try {
      await axios.delete(`/api/blog/tags/${id}`);
    } catch (error) {
      this.logger.error('Failed to delete tag', error);
      throw error;
    }
  }

  // Add missing methods for comments
  async getComments(blogId: string): Promise<any[]> {
    try {
      const response = await axios.get(`/api/blog/${blogId}/comments`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get comments', error);
      throw error;
    }
  }

  async addComment(blogId: string, comment: any): Promise<any> {
    try {
      const response = await axios.post(`/api/blog/${blogId}/comments`, comment);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to add comment', error);
      throw error;
    }
  }
}

export default BlogService;
