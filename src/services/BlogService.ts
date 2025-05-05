
import EnhancedApiService from './EnhancedApiService';
import { BlogPost, BlogCategory, BlogTag } from '@/types/Blog';
import { ApiResponse } from '@/types/Common';

class BlogService {
  private static BASE_URL = '/api/blogs';
  private static CATEGORIES_URL = '/api/blog/categories';
  private static TAGS_URL = '/api/blog/tags';

  static async getPosts(): Promise<ApiResponse<BlogPost[]>> {
    try {
      const response = await EnhancedApiService.get<BlogPost[]>(this.BASE_URL);
      return {
        success: true,
        message: 'Blog posts retrieved successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return {
        success: false,
        message: 'Failed to fetch blog posts',
        data: [],
        error: 'An error occurred while fetching blog posts'
      };
    }
  }

  static async getPost(id: string): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await EnhancedApiService.get<BlogPost>(`${this.BASE_URL}/${id}`);
      return {
        success: true,
        message: 'Blog post retrieved successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching blog post ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch blog post',
        data: {} as BlogPost,
        error: 'An error occurred while fetching the blog post'
      };
    }
  }

  static async createPost(data: BlogPost): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await EnhancedApiService.post<BlogPost>(this.BASE_URL, data);
      return {
        success: true,
        message: 'Blog post created successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error creating blog post:', error);
      return {
        success: false,
        message: 'Failed to create blog post',
        data: {} as BlogPost,
        error: 'An error occurred while creating the blog post'
      };
    }
  }

  static async updatePost(id: string, data: BlogPost): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await EnhancedApiService.put<BlogPost>(`${this.BASE_URL}/${id}`, data);
      return {
        success: true,
        message: 'Blog post updated successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error updating blog post ${id}:`, error);
      return {
        success: false,
        message: 'Failed to update blog post',
        data: {} as BlogPost,
        error: 'An error occurred while updating the blog post'
      };
    }
  }

  static async deletePost(id: string): Promise<ApiResponse<void>> {
    try {
      await EnhancedApiService.delete(`${this.BASE_URL}/${id}`);
      return {
        success: true,
        message: 'Blog post deleted successfully',
        data: undefined,
        error: null
      };
    } catch (error) {
      console.error(`Error deleting blog post ${id}:`, error);
      return {
        success: false,
        message: 'Failed to delete blog post',
        data: undefined,
        error: 'An error occurred while deleting the blog post'
      };
    }
  }

  static async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await EnhancedApiService.post<{ url: string }>(`${this.BASE_URL}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        } as any, // Type assertion to fix the error
      });
      
      return {
        success: true,
        message: 'Image uploaded successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        message: 'Failed to upload image',
        data: { url: '' },
        error: 'An error occurred while uploading the image'
      };
    }
  }

  // Add category methods
  static async getCategories(): Promise<ApiResponse<BlogCategory[]>> {
    try {
      const response = await EnhancedApiService.get<BlogCategory[]>(this.CATEGORIES_URL);
      return {
        success: true,
        message: 'Categories retrieved successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        message: 'Failed to fetch categories',
        data: [],
        error: 'An error occurred while fetching categories'
      };
    }
  }

  static async createCategory(data: Partial<BlogCategory>): Promise<ApiResponse<BlogCategory>> {
    try {
      const response = await EnhancedApiService.post<BlogCategory>(this.CATEGORIES_URL, data);
      return {
        success: true,
        message: 'Category created successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        success: false,
        message: 'Failed to create category',
        data: {} as BlogCategory,
        error: 'An error occurred while creating the category'
      };
    }
  }

  static async updateCategory(id: string, data: Partial<BlogCategory>): Promise<ApiResponse<BlogCategory>> {
    try {
      const response = await EnhancedApiService.put<BlogCategory>(`${this.CATEGORIES_URL}/${id}`, data);
      return {
        success: true,
        message: 'Category updated successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      return {
        success: false,
        message: 'Failed to update category',
        data: {} as BlogCategory,
        error: 'An error occurred while updating the category'
      };
    }
  }

  static async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      await EnhancedApiService.delete(`${this.CATEGORIES_URL}/${id}`);
      return {
        success: true,
        message: 'Category deleted successfully',
        data: undefined,
        error: null
      };
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      return {
        success: false,
        message: 'Failed to delete category',
        data: undefined,
        error: 'An error occurred while deleting the category'
      };
    }
  }

  // Add tag methods
  static async getTags(): Promise<ApiResponse<BlogTag[]>> {
    try {
      const response = await EnhancedApiService.get<BlogTag[]>(this.TAGS_URL);
      return {
        success: true,
        message: 'Tags retrieved successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error fetching tags:', error);
      return {
        success: false,
        message: 'Failed to fetch tags',
        data: [],
        error: 'An error occurred while fetching tags'
      };
    }
  }

  static async createTag(data: Partial<BlogTag>): Promise<ApiResponse<BlogTag>> {
    try {
      const response = await EnhancedApiService.post<BlogTag>(this.TAGS_URL, data);
      return {
        success: true,
        message: 'Tag created successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error creating tag:', error);
      return {
        success: false,
        message: 'Failed to create tag',
        data: {} as BlogTag,
        error: 'An error occurred while creating the tag'
      };
    }
  }

  static async updateTag(id: string, data: Partial<BlogTag>): Promise<ApiResponse<BlogTag>> {
    try {
      const response = await EnhancedApiService.put<BlogTag>(`${this.TAGS_URL}/${id}`, data);
      return {
        success: true,
        message: 'Tag updated successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error updating tag ${id}:`, error);
      return {
        success: false,
        message: 'Failed to update tag',
        data: {} as BlogTag,
        error: 'An error occurred while updating the tag'
      };
    }
  }

  static async deleteTag(id: string): Promise<ApiResponse<void>> {
    try {
      await EnhancedApiService.delete(`${this.TAGS_URL}/${id}`);
      return {
        success: true,
        message: 'Tag deleted successfully',
        data: undefined,
        error: null
      };
    } catch (error) {
      console.error(`Error deleting tag ${id}:`, error);
      return {
        success: false,
        message: 'Failed to delete tag',
        data: undefined,
        error: 'An error occurred while deleting the tag'
      };
    }
  }
}

export default BlogService;
