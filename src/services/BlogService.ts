import EnhancedApiService from './EnhancedApiService';
import { BlogPost, BlogComment, BlogCategory, BlogTag } from '@/types/Blog';

// Mock data for fallback when API fails
const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with React",
    slug: "getting-started-with-react",
    content: "React is a popular JavaScript library for building user interfaces...",
    excerpt: "Learn the basics of React and how to create your first component.",
    authorId: "1",
    authorName: "Jane Smith",
    publishDate: "2023-04-15T10:30:00",
    status: "published",
    coverImage: "https://via.placeholder.com/800x450",
    categoryId: "1",
    categoryName: "Tutorials",
    tags: ["react", "javascript", "frontend"],
    createdAt: "2023-04-10T14:15:00",
    updatedAt: "2023-04-15T10:30:00",
    commentCount: 5,
    viewCount: 123
  },
  {
    id: "2",
    title: "Advanced TypeScript Patterns",
    slug: "advanced-typescript-patterns",
    content: "TypeScript offers many advanced features that can improve your code...",
    excerpt: "Discover advanced TypeScript patterns to write better code.",
    authorId: "2",
    authorName: "John Doe",
    publishDate: "2023-04-10T14:15:00",
    status: "published",
    coverImage: "https://via.placeholder.com/800x450",
    categoryId: "2",
    categoryName: "Programming",
    tags: ["typescript", "javascript", "patterns"],
    createdAt: "2023-03-10T14:15:00",
    updatedAt: "2023-04-10T14:15:00",
    commentCount: 3,
    viewCount: 87
  },
  // ... Additional mock posts would go here
];

class BlogService {
  async getPosts(limit = 10, offset = 0): Promise<{ success: boolean; data: BlogPost[] }> {
    try {
      const response = await EnhancedApiService.get<{ posts: BlogPost[] }>(
        `/api/blog/posts?limit=${limit}&offset=${offset}`
      );
      
      if (response.success && response.data) {
        return { success: true, data: response.data.posts };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: MOCK_BLOG_POSTS };
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return { success: false, data: MOCK_BLOG_POSTS };
    }
  }

  async getPostBySlug(slug: string): Promise<{ success: boolean; data: BlogPost | null }> {
    try {
      const response = await EnhancedApiService.get<{ post: BlogPost }>(`/api/blog/posts/${slug}`);
      
      if (response.success && response.data && response.data.post) {
        return { success: true, data: response.data.post };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error('Error fetching blog post by slug:', error);
      return { success: false, data: null };
    }
  }

  async getPost(id: string): Promise<{ success: boolean; data: BlogPost }> {
    try {
      const response = await EnhancedApiService.get<{ post: BlogPost }>(`/api/blog/posts/id/${id}`);
      
      if (response.success && response.data && response.data.post) {
        return { success: true, data: response.data.post };
      } else {
        console.warn('API request successful but no data:', response);
        const mockPost = MOCK_BLOG_POSTS.find(post => post.id === id) || MOCK_BLOG_POSTS[0];
        return { success: false, data: mockPost };
      }
    } catch (error) {
      console.error('Error fetching blog post by id:', error);
      const mockPost = MOCK_BLOG_POSTS.find(post => post.id === id) || MOCK_BLOG_POSTS[0];
      return { success: false, data: mockPost };
    }
  }

  async createPost(postData: Partial<BlogPost>): Promise<{ success: boolean; data: BlogPost | null }> {
    try {
      const response = await EnhancedApiService.post<{ post: BlogPost }>('/api/blog/posts', postData);
      
      if (response.success && response.data && response.data.post) {
        return { success: true, data: response.data.post };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      return { success: false, data: null };
    }
  }

  async updatePost(id: string, postData: Partial<BlogPost>): Promise<{ success: boolean; data: BlogPost | null }> {
    try {
      const response = await EnhancedApiService.put<{ post: BlogPost }>(`/api/blog/posts/${id}`, postData);
      
      if (response.success && response.data && response.data.post) {
        return { success: true, data: response.data.post };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error('Error updating blog post:', error);
      return { success: false, data: null };
    }
  }

  async deletePost(id: string): Promise<{ success: boolean }> {
    try {
      const response = await EnhancedApiService.delete(`/api/blog/posts/${id}`);
      return { success: response.success };
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return { success: false };
    }
  }

  async getComments(postId: string, limit = 10, offset = 0): Promise<{ success: boolean; data: { content: BlogComment[] } }> {
    try {
      const response = await EnhancedApiService.get<{ comments: BlogComment[] }>(
        `/api/blog/posts/${postId}/comments?limit=${limit}&offset=${offset}`
      );
      
      if (response.success && response.data) {
        return { success: true, data: { content: response.data.comments } };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: { content: this.fallbackComments } };
      }
    } catch (error) {
      console.error('Error fetching blog comments:', error);
      return { success: false, data: { content: this.fallbackComments } };
    }
  }

  async addComment(postId: string, commentData: Partial<BlogComment>): Promise<{ success: boolean; data: BlogComment | null }> {
    try {
      const response = await EnhancedApiService.post<{ comment: BlogComment }>(
        `/api/blog/posts/${postId}/comments`,
        commentData
      );
      
      if (response.success && response.data && response.data.comment) {
        return { success: true, data: response.data.comment };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error('Error creating blog comment:', error);
      return { success: false, data: null };
    }
  }

  async updateComment(commentId: string, commentData: Partial<BlogComment>): Promise<{ success: boolean; data: BlogComment | null }> {
    try {
      const response = await EnhancedApiService.put<{ comment: BlogComment }>(
        `/api/blog/comments/${commentId}`,
        commentData
      );
      
      if (response.success && response.data && response.data.comment) {
        return { success: true, data: response.data.comment };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error('Error updating blog comment:', error);
      return { success: false, data: null };
    }
  }

  async deleteComment(commentId: string): Promise<{ success: boolean }> {
    try {
      const response = await EnhancedApiService.delete(`/api/blog/comments/${commentId}`);
      return { success: response.success };
    } catch (error) {
      console.error('Error deleting blog comment:', error);
      return { success: false };
    }
  }

  async getCategories(): Promise<{ success: boolean; data: BlogCategory[] }> {
    try {
      const response = await EnhancedApiService.get<{ categories: BlogCategory[] }>('/api/blog/categories');
      
      if (response.success && response.data) {
        return { success: true, data: response.data.categories };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: this.fallbackCategories };
      }
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      return { success: false, data: this.fallbackCategories };
    }
  }

  async createCategory(categoryData: BlogCategory): Promise<{ success: boolean; data: BlogCategory | null }> {
    try {
      const response = await EnhancedApiService.post<{ category: BlogCategory }>('/api/blog/categories', categoryData);
      
      if (response.success && response.data && response.data.category) {
        return { success: true, data: response.data.category };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error('Error creating blog category:', error);
      return { success: false, data: null };
    }
  }

  async updateCategory(categoryId: string, categoryData: BlogCategory): Promise<{ success: boolean; data: BlogCategory | null }> {
    try {
      const response = await EnhancedApiService.put<{ category: BlogCategory }>(
        `/api/blog/categories/${categoryId}`,
        categoryData
      );
      
      if (response.success && response.data && response.data.category) {
        return { success: true, data: response.data.category };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error('Error updating blog category:', error);
      return { success: false, data: null };
    }
  }

  async deleteCategory(categoryId: string): Promise<{ success: boolean }> {
    try {
      const response = await EnhancedApiService.delete(`/api/blog/categories/${categoryId}`);
      return { success: response.success };
    } catch (error) {
      console.error('Error deleting blog category:', error);
      return { success: false };
    }
  }

  async getTags(): Promise<{ success: boolean; data: BlogTag[] }> {
    try {
      const response = await EnhancedApiService.get<{ tags: BlogTag[] }>('/api/blog/tags');
      
      if (response.success && response.data) {
        return { success: true, data: response.data.tags };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: this.fallbackTags };
      }
    } catch (error) {
      console.error('Error fetching blog tags:', error);
      return { success: false, data: this.fallbackTags };
    }
  }

  async createTag(tagData: BlogTag): Promise<{ success: boolean; data: BlogTag | null }> {
    try {
      const response = await EnhancedApiService.post<{ tag: BlogTag }>('/api/blog/tags', tagData);
      
      if (response.success && response.data && response.data.tag) {
        return { success: true, data: response.data.tag };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error('Error creating blog tag:', error);
      return { success: false, data: null };
    }
  }

  async updateTag(tagId: string, tagData: BlogTag): Promise<{ success: boolean; data: BlogTag | null }> {
    try {
      const response = await EnhancedApiService.put<{ tag: BlogTag }>(`/api/blog/tags/${tagId}`, tagData);
      
      if (response.success && response.data && response.data.tag) {
        return { success: true, data: response.data.tag };
      } else {
        console.warn('API request successful but no data:', response);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error('Error updating blog tag:', error);
      return { success: false, data: null };
    }
  }

  async deleteTag(tagId: string): Promise<{ success: boolean }> {
    try {
      const response = await EnhancedApiService.delete(`/api/blog/tags/${tagId}`);
      return { success: response.success };
    } catch (error) {
      console.error('Error deleting blog tag:', error);
      return { success: false };
    }
  }

  async uploadImage(file: File): Promise<{ success: boolean; data: { url: string } }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await EnhancedApiService.post<{ url: string }>(
        '/api/blog/upload', 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      if (response.success && response.data && response.data.url) {
        return { 
          success: true, 
          data: { url: response.data.url } 
        };
      } else {
        console.warn('Upload API request successful but no data:', response);
        
        const fakeUrl = URL.createObjectURL(file);
        return { 
          success: false, 
          data: { url: fakeUrl } 
        };
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      
      const fakeUrl = URL.createObjectURL(file);
      return { 
        success: false, 
        data: { url: fakeUrl } 
      };
    }
  }

  // Fix the mock comments
  private fallbackComments: BlogComment[] = [
    {
      id: "c1",
      postId: "1",
      authorId: "3",
      authorName: "Alice Johnson",
      authorEmail: "alice@example.com",
      content: "Great article! This really helped me understand React better.",
      createdAt: "2023-04-16T08:30:00",
      status: "approved"
    },
    {
      id: "c2",
      postId: "1",
      authorId: "4",
      authorName: "Bob Wilson",
      authorEmail: "bob@example.com",
      content: "I have a question about the useState hook. Can you elaborate?",
      createdAt: "2023-04-16T09:45:00",
      status: "approved"
    }
  ];
  
  // Fix the mock categories
  private fallbackCategories: BlogCategory[] = [
    { id: "1", name: "Tutorials", slug: "tutorials", postCount: 5 },
    { id: "2", name: "Programming", slug: "programming", postCount: 8 },
    { id: "3", name: "Design", slug: "design", postCount: 3 },
    { id: "4", name: "Career", slug: "career", postCount: 2 }
  ];
  
  // Fix the mock tags
  private fallbackTags: BlogTag[] = [
    { id: "1", name: "React", slug: "react", postCount: 7 },
    { id: "2", name: "TypeScript", slug: "typescript", postCount: 5 },
    { id: "3", name: "JavaScript", slug: "javascript", postCount: 12 },
    { id: "4", name: "CSS", slug: "css", postCount: 4 },
    { id: "5", name: "Frontend", slug: "frontend", postCount: 9 }
  ];
}

export default new BlogService();
