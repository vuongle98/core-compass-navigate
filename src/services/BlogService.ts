
import EnhancedApiService from './EnhancedApiService';
import { BlogPost } from '@/types/Blog';
import { ApiResponse } from '@/types/Common';

class BlogService {
  private static BASE_URL = '/api/blogs';

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
        },
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
}

export default BlogService;
