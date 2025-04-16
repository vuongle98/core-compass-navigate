import EnhancedApiService, { ApiResponse, PaginatedData, PaginationOptions } from './EnhancedApiService';
import LoggingService from './LoggingService';
import { BlogPost, BlogComment, BlogCategory, BlogTag } from '@/types/Blog';

const mockBlogPosts: BlogPost[] = [
  {
    id: "mock-1",
    title: "Getting Started with React",
    content: "React is a powerful JavaScript library for building user interfaces...",
    excerpt: "An introduction to React fundamentals and best practices",
    author: "Jane Doe",
    authorId: "auth-1",
    authorName: "Jane Doe",
    publishDate: new Date().toISOString(),
    status: "published",
    categoryId: "cat-1",
    categoryName: "Development",
    tags: ["react", "javascript", "frontend"],
    commentCount: 5,
    featuredImage: "https://placehold.co/600x400?text=React"
  },
  {
    id: "mock-2",
    title: "Modern TypeScript Patterns",
    content: "TypeScript enhances JavaScript by adding static type definitions...",
    excerpt: "Learn advanced TypeScript patterns for better code quality",
    author: "John Smith",
    authorId: "auth-2",
    authorName: "John Smith",
    publishDate: new Date().toISOString(),
    status: "published",
    categoryId: "cat-2",
    categoryName: "Programming",
    tags: ["typescript", "javascript", "development"],
    commentCount: 3,
    featuredImage: "https://placehold.co/600x400?text=TypeScript"
  }
];

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
        "Failed to fetch blog posts, using mock data", 
        { error, options }
      );
      
      const page = options.page || 0;
      const size = options.pageSize || 10;
      const start = page * size;
      const end = start + size;
      const paginatedPosts = mockBlogPosts.slice(start, end);
      
      return {
        data: {
          content: paginatedPosts,
          totalElements: mockBlogPosts.length,
          totalPages: Math.ceil(mockBlogPosts.length / size),
          number: page,
          size: size
        },
        success: true,
        message: "Using mock data due to API failure"
      };
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
        `Failed to fetch blog post with ID: ${id}, using mock data`, 
        { error }
      );
      
      const mockPost = mockBlogPosts.find(post => post.id === id) || mockBlogPosts[0];
      
      return {
        data: mockPost,
        success: true,
        message: "Using mock data due to API failure"
      };
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
      
      return {
        data: { url: `https://placehold.co/800x400?text=${encodeURIComponent(file.name)}` },
        success: true,
        message: "Using mock image URL due to API failure"
      };
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
        `Failed to fetch comments for post ID: ${postId}, using mock data`, 
        { error, options }
      );
      
      const mockComments: BlogComment[] = [
        {
          id: "comment-1",
          postId: postId,
          authorId: "user-1",
          authorName: "Reader One",
          content: "Great article! Very informative.",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: "approved"
        },
        {
          id: "comment-2",
          postId: postId,
          authorId: "user-2",
          authorName: "Reader Two",
          content: "I have a question about the third point you made...",
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          status: "approved"
        }
      ];
      
      return {
        data: {
          content: mockComments,
          totalElements: mockComments.length,
          totalPages: 1,
          number: 0,
          size: mockComments.length
        },
        success: true,
        message: "Using mock comments due to API failure"
      };
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
        "Failed to fetch blog categories, using mock data", 
        { error }
      );
      
      const mockCategories: BlogCategory[] = [
        { id: "cat-1", name: "Development", slug: "development" },
        { id: "cat-2", name: "Programming", slug: "programming" },
        { id: "cat-3", name: "Design", slug: "design" },
        { id: "cat-4", name: "Business", slug: "business" }
      ];
      
      return {
        data: mockCategories,
        success: true,
        message: "Using mock categories due to API failure"
      };
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
        "Failed to fetch blog tags, using mock data", 
        { error }
      );
      
      const mockTags: BlogTag[] = [
        { id: "tag-1", name: "React", slug: "react" },
        { id: "tag-2", name: "JavaScript", slug: "javascript" },
        { id: "tag-3", name: "TypeScript", slug: "typescript" },
        { id: "tag-4", name: "Frontend", slug: "frontend" },
        { id: "tag-5", name: "Development", slug: "development" }
      ];
      
      return {
        data: mockTags,
        success: true,
        message: "Using mock tags due to API failure"
      };
    }
  }
}

export default new BlogService();
