import EnhancedApiService from './EnhancedApiService';
import { BlogCategory, BlogPost, BlogTag } from '@/types/Blog';
import { ApiResponse, PageData } from '@/types/Common';

class BlogService {
  private static BASE_URL = '/api/v1/blogs';

  // Posts
  static async getPosts(params: any = {}): Promise<PageData<BlogPost>> {
    try {
      return await EnhancedApiService.get<PageData<BlogPost>>(`${this.BASE_URL}/posts`, { params });
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  }

  static async getPost(id: string): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await EnhancedApiService.get<BlogPost>(`${this.BASE_URL}/posts/${id}`);
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

  static async createPost(data: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await EnhancedApiService.post<BlogPost>(`${this.BASE_URL}/posts`, data);
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

  static async updatePost(id: string, data: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await EnhancedApiService.put<BlogPost>(`${this.BASE_URL}/posts/${id}`, data);
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
      await EnhancedApiService.delete(`${this.BASE_URL}/posts/${id}`);
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

  // Categories
  static async getCategories(params: any = {}): Promise<ApiResponse<PageData<BlogCategory>>> {
    try {
      const response = await EnhancedApiService.get<PageData<BlogCategory>>(`${this.BASE_URL}/categories`, { params });
      return {
        success: true,
        message: 'Blog categories retrieved successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      return {
        success: false,
        message: 'Failed to fetch blog categories',
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 0,
          number: 0
        },
        error: 'An error occurred while fetching blog categories'
      };
    }
  }

  static async getCategory(id: string): Promise<ApiResponse<BlogCategory>> {
    try {
      const response = await EnhancedApiService.get<BlogCategory>(`${this.BASE_URL}/categories/${id}`);
      return {
        success: true,
        message: 'Blog category retrieved successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching blog category ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch blog category',
        data: {} as BlogCategory,
        error: 'An error occurred while fetching the blog category'
      };
    }
  }

  static async createCategory(data: Partial<BlogCategory>): Promise<ApiResponse<BlogCategory>> {
    try {
      const response = await EnhancedApiService.post<BlogCategory>(`${this.BASE_URL}/categories`, data);
      return {
        success: true,
        message: 'Blog category created successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error creating blog category:', error);
      return {
        success: false,
        message: 'Failed to create blog category',
        data: {} as BlogCategory,
        error: 'An error occurred while creating the blog category'
      };
    }
  }

  static async updateCategory(id: string, data: Partial<BlogCategory>): Promise<ApiResponse<BlogCategory>> {
    try {
      const response = await EnhancedApiService.put<BlogCategory>(`${this.BASE_URL}/categories/${id}`, data);
      return {
        success: true,
        message: 'Blog category updated successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error updating blog category ${id}:`, error);
      return {
        success: false,
        message: 'Failed to update blog category',
        data: {} as BlogCategory,
        error: 'An error occurred while updating the blog category'
      };
    }
  }

  static async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      await EnhancedApiService.delete(`${this.BASE_URL}/categories/${id}`);
      return {
        success: true,
        message: 'Blog category deleted successfully',
        data: undefined,
        error: null
      };
    } catch (error) {
      console.error(`Error deleting blog category ${id}:`, error);
      return {
        success: false,
        message: 'Failed to delete blog category',
        data: undefined,
        error: 'An error occurred while deleting the blog category'
      };
    }
  }

  // Tags
  static async getTags(params: any = {}): Promise<ApiResponse<PageData<BlogTag>>> {
    try {
      const response = await EnhancedApiService.get<PageData<BlogTag>>(`${this.BASE_URL}/tags`, { params });
      return {
        success: true,
        message: 'Blog tags retrieved successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error fetching blog tags:', error);
      return {
        success: false,
        message: 'Failed to fetch blog tags',
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 0,
          number: 0
        },
        error: 'An error occurred while fetching blog tags'
      };
    }
  }

  static async getTag(id: string): Promise<ApiResponse<BlogTag>> {
    try {
      const response = await EnhancedApiService.get<BlogTag>(`${this.BASE_URL}/tags/${id}`);
      return {
        success: true,
        message: 'Blog tag retrieved successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching blog tag ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch blog tag',
        data: {} as BlogTag,
        error: 'An error occurred while fetching the blog tag'
      };
    }
  }

  static async createTag(data: Partial<BlogTag>): Promise<ApiResponse<BlogTag>> {
    try {
      const response = await EnhancedApiService.post<BlogTag>(`${this.BASE_URL}/tags`, data);
      return {
        success: true,
        message: 'Blog tag created successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error creating blog tag:', error);
      return {
        success: false,
        message: 'Failed to create blog tag',
        data: {} as BlogTag,
        error: 'An error occurred while creating the blog tag'
      };
    }
  }

  // Add or update these methods to properly handle string or number IDs
  static async updateTag(id: string | number, data: Partial<BlogTag>): Promise<ApiResponse<BlogTag>> {
    try {
      const idStr = id.toString(); // Convert number to string if needed
      const response = await EnhancedApiService.put<BlogTag>(`${this.BASE_URL}/tags/${idStr}`, data);
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

  static async deleteTag(id: string | number): Promise<ApiResponse<void>> {
    try {
      const idStr = id.toString(); // Convert number to string if needed
      await EnhancedApiService.delete(`${this.BASE_URL}/tags/${idStr}`);
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

  // Add the missing uploadImage method
  static async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload the image
      const response = await EnhancedApiService.post<{ url: string }>(`${this.BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        message: 'Image uploaded successfully',
        data: { url: response.url },
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
}

export default BlogService;
