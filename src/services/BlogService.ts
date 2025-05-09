import EnhancedApiService from "./EnhancedApiService";
import { BlogCategory, BlogPost, BlogTag } from "@/types/Blog";
import { ApiResponse, PageData } from "@/types/Common";
import LoggingService from "./LoggingService";

class BlogService {
  private static BASE_URL = "/api/v1/blogs";

  // Posts
  static async getPosts(
    params: Record<string, string> = {}
  ): Promise<PageData<BlogPost>> {
    try {
      return await EnhancedApiService.get<PageData<BlogPost>>(
        `${this.BASE_URL}/posts`,
        { params }
      );
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      LoggingService.error(
        "blog_service",
        "get_posts_failed",
        "Failed to fetch posts",
        error
      );
      throw error;
    }
  }

  static async getPost(id: string): Promise<BlogPost> {
    try {
      return await EnhancedApiService.get<BlogPost>(
        `${this.BASE_URL}/posts/${id}`
      );
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "get_post_failed",
        `Failed to fetch blog post ${id}`,
        error
      );
      throw error;
    }
  }

  static async createPost(data: Partial<BlogPost>): Promise<BlogPost> {
    try {
      return await EnhancedApiService.post<BlogPost>(
        `${this.BASE_URL}/posts`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "create_post_failed",
        "Failed to create blog post",
        error
      );
      throw error;
    }
  }

  static async updatePost(
    id: string,
    data: Partial<BlogPost>
  ): Promise<BlogPost> {
    try {
      return await EnhancedApiService.put<BlogPost>(
        `${this.BASE_URL}/posts/${id}`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "update_post_failed",
        `Failed to update blog post ${id}`,
        error
      );
      throw error;
    }
  }

  static async deletePost(id: string): Promise<void> {
    try {
      await EnhancedApiService.delete(`${this.BASE_URL}/posts/${id}`);
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "delete_post_failed",
        `Failed to delete blog post ${id}`,
        error
      );
      throw error;
    }
  }

  // Categories
  static async getCategories(
    params: Record<string, string> = {}
  ): Promise<PageData<BlogCategory>> {
    try {
      return await EnhancedApiService.getPaginated(
        `${this.BASE_URL}/categories`,
        { params }
      );
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "get_posts_failed",
        "Failed to fetch posts",
        error
      );
      throw error;
    }
  }

  static async getCategory(id: string): Promise<BlogCategory> {
    try {
      return await EnhancedApiService.get<BlogCategory>(
        `${this.BASE_URL}/categories/${id}`
      );
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "get_category_failed",
        `Failed to fetch blog category ${id}`,
        error
      );
      throw error;
    }
  }

  static async createCategory(
    data: Partial<BlogCategory>
  ): Promise<BlogCategory> {
    try {
      return await EnhancedApiService.post<BlogCategory>(
        `${this.BASE_URL}/categories`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "create_category_failed",
        "Failed to create blog category",
        error
      );
      throw error;
    }
  }

  static async updateCategory(
    id: string,
    data: Partial<BlogCategory>
  ): Promise<BlogCategory> {
    try {
      return await EnhancedApiService.put<BlogCategory>(
        `${this.BASE_URL}/categories/${id}`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "update_category_failed",
        `Failed to update blog category ${id}`,
        error
      );
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      await EnhancedApiService.delete(`${this.BASE_URL}/categories/${id}`);
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "delete_category_failed",
        `Failed to delete blog category ${id}`,
        error
      );
      throw error;
    }
  }

  // Tags
  static async getTags(
    params: Record<string, string> = {}
  ): Promise<PageData<BlogTag>> {
    try {
      return await EnhancedApiService.get<PageData<BlogTag>>(
        `${this.BASE_URL}/tags`,
        { params }
      );
    } catch (error) {
      console.error("Error fetching blog tags:", error);
      LoggingService.error(
        "blog_service",
        "get_tags_failed",
        "Failed to fetch tags",
        error
      );
      throw error;
    }
  }

  static async getTag(id: string): Promise<BlogTag> {
    try {
      return EnhancedApiService.get<BlogTag>(`${this.BASE_URL}/tags/${id}`);
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "get_tag_failed",
        `Failed to fetch blog tag ${id}`,
        error
      );
      throw error;
    }
  }

  static async createTag(data: Partial<BlogTag>): Promise<BlogTag> {
    try {
      return await EnhancedApiService.post<BlogTag>(
        `${this.BASE_URL}/tags`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "create_tag_failed",
        "Failed to create blog tag",
        error
      );
      throw error;
    }
  }

  // Add or update these methods to properly handle string or number IDs
  static async updateTag(
    id: string | number,
    data: Partial<BlogTag>
  ): Promise<BlogTag> {
    try {
      const idStr = id.toString(); // Convert number to string if needed
      return await EnhancedApiService.put<BlogTag>(
        `${this.BASE_URL}/tags/${idStr}`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "blog_service",
        "update_tag_failed",
        `Failed to update blog tag ${id}`,
        error
      );
      throw error;
    }
  }

  static async deleteTag(id: string | number): Promise<void> {
    try {
      const idStr = id.toString(); // Convert number to string if needed
      await EnhancedApiService.delete(`${this.BASE_URL}/tags/${idStr}`);
    } catch (error) {
      console.error(`Error deleting tag ${id}:`, error);

      LoggingService.error(
        "blog_service",
        "delete_tag_failed",
        `Failed to delete blog tag ${id}`,
        error
      );
      throw error;
    }
  }

  // Add the missing uploadImage method
  static async uploadImage(file: File): Promise<{ url: string }> {
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("image", file);

      // Upload the image - fix the headers type issue
      return await EnhancedApiService.post<{ url: string }>(
        `${this.BASE_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      console.error("Error uploading image:", error);

      LoggingService.error(
        "blog_service",
        "upload_image_failed",
        "Failed to upload image",
        error
      );

      throw error;
    }
  }
}

export default BlogService;
