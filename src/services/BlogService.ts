
import axios from "axios";
import { BlogPost, BlogCategory, BlogTag } from "@/types/Blog";

/**
 * Service for handling blog-related operations
 */
class BlogService {
  private static instance: BlogService;

  private constructor() {}

  static getInstance(): BlogService {
    if (!BlogService.instance) {
      BlogService.instance = new BlogService();
    }
    return BlogService.instance;
  }

  // Blog Post methods
  static async getPost(id: string): Promise<any> {
    try {
      const response = await axios.get(`/api/blog/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get post:', error);
      throw error;
    }
  }

  static async createPost(post: Partial<BlogPost>): Promise<any> {
    try {
      const response = await axios.post('/api/blog', post);
      return response.data;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  static async updatePost(id: string, post: Partial<BlogPost>): Promise<any> {
    try {
      const response = await axios.put(`/api/blog/${id}`, post);
      return response.data;
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  }

  static async deletePost(id: string): Promise<any> {
    try {
      const response = await axios.delete(`/api/blog/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  }

  // Image upload method
  static async uploadImage(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/blog/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.info('Image uploaded successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to upload image', error);
      throw new Error('Failed to upload image');
    }
  }

  // Category methods
  static async getCategories(): Promise<any> {
    try {
      const response = await axios.get('/api/blog/categories');
      return response.data;
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw error;
    }
  }

  static async createCategory(category: Partial<BlogCategory>): Promise<any> {
    try {
      const response = await axios.post('/api/blog/categories', category);
      return response.data;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }

  static async updateCategory(id: string, category: Partial<BlogCategory>): Promise<any> {
    try {
      const response = await axios.put(`/api/blog/categories/${id}`, category);
      return response.data;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<any> {
    try {
      const response = await axios.delete(`/api/blog/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }

  // Tag methods
  static async getTags(): Promise<any> {
    try {
      const response = await axios.get('/api/blog/tags');
      return response.data;
    } catch (error) {
      console.error('Failed to get tags:', error);
      throw error;
    }
  }

  static async createTag(tag: Partial<BlogTag>): Promise<any> {
    try {
      const response = await axios.post('/api/blog/tags', tag);
      return response.data;
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  }

  static async updateTag(id: string, tag: Partial<BlogTag>): Promise<any> {
    try {
      const response = await axios.put(`/api/blog/tags/${id}`, tag);
      return response.data;
    } catch (error) {
      console.error('Failed to update tag:', error);
      throw error;
    }
  }

  static async deleteTag(id: string): Promise<any> {
    try {
      const response = await axios.delete(`/api/blog/tags/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete tag:', error);
      throw error;
    }
  }

  // Comment methods
  static async getComments(blogId: string): Promise<any> {
    try {
      const response = await axios.get(`/api/blog/${blogId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Failed to get comments:', error);
      throw error;
    }
  }

  static async addComment(blogId: string, comment: any): Promise<any> {
    try {
      const response = await axios.post(`/api/blog/${blogId}/comments`, comment);
      return response.data;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }
}

export default BlogService;
