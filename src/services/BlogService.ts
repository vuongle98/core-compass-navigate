
import EnhancedApiService from "./EnhancedApiService";
import { BlogPost, BlogComment, BlogCategory, BlogTag } from "@/types/Blog";

class BlogService {
  // Mock data for categories
  private mockCategories: BlogCategory[] = [
    {
      id: "cat-1",
      name: "Development",
      slug: "development",
      description: "Programming and development related articles",
      postCount: 12,
      color: "#3b82f6",
      isActive: true
    },
    {
      id: "cat-2",
      name: "Design",
      slug: "design",
      description: "UI/UX and graphic design topics",
      postCount: 8,
      color: "#ec4899",
      isActive: true
    },
    {
      id: "cat-3",
      name: "Marketing",
      slug: "marketing",
      description: "Digital marketing strategies and tips",
      postCount: 5,
      color: "#10b981",
      isActive: true
    },
    {
      id: "cat-4",
      name: "Business",
      slug: "business",
      description: "Business strategy and entrepreneurship",
      postCount: 7,
      color: "#f59e0b",
      isActive: true
    }
  ];
  
  // Mock data for tags
  private mockTags: BlogTag[] = [
    { id: "tag-1", name: "React", slug: "react", postCount: 8, color: "#61dafb" },
    { id: "tag-2", name: "TypeScript", slug: "typescript", postCount: 7, color: "#3178c6" },
    { id: "tag-3", name: "JavaScript", slug: "javascript", postCount: 10, color: "#f7df1e" },
    { id: "tag-4", name: "CSS", slug: "css", postCount: 6, color: "#264de4" },
    { id: "tag-5", name: "UI/UX", slug: "ui-ux", postCount: 5, color: "#ff7262" },
    { id: "tag-6", name: "Node.js", slug: "nodejs", postCount: 4, color: "#339933" },
    { id: "tag-7", name: "SEO", slug: "seo", postCount: 3, color: "#47bec7" },
    { id: "tag-8", name: "Tailwind", slug: "tailwind", postCount: 5, color: "#06b6d4" }
  ];
  
  // Mock posts
  private mockPosts: BlogPost[] = [
    {
      id: "post-1",
      title: "Getting Started with React Hooks",
      slug: "getting-started-with-react-hooks",
      content: `
        <h2>Introduction to React Hooks</h2>
        <p>Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class. In this tutorial, we'll explore the most commonly used hooks.</p>
        <h3>useState Hook</h3>
        <p>The useState hook lets you add state to functional components. It returns a stateful value and a function to update it.</p>
        <pre><code>const [count, setCount] = useState(0);</code></pre>
        <h3>useEffect Hook</h3>
        <p>The useEffect hook lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes.</p>
      `,
      excerpt: "Learn how to use React Hooks to simplify your components and share stateful logic.",
      coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop",
      publishDate: "2023-05-15T10:30:00Z",
      status: "published",
      authorId: "author-1",
      authorName: "Jane Smith",
      categoryId: "cat-1",
      categoryName: "Development",
      tags: ["React", "JavaScript", "Hooks"],
      metaTitle: "React Hooks Tutorial - Getting Started with useState and useEffect",
      metaDescription: "Learn how to use React Hooks to simplify your components and share stateful logic",
      metaKeywords: ["React", "Hooks", "useState", "useEffect", "Tutorial"],
      createdAt: "2023-05-10T08:15:00Z",
      updatedAt: "2023-05-15T10:30:00Z",
      commentCount: 8,
      viewCount: 1250
    },
    {
      id: "post-2",
      title: "Mastering CSS Grid Layout",
      slug: "mastering-css-grid-layout",
      content: `
        <h2>Understanding CSS Grid</h2>
        <p>CSS Grid Layout is a two-dimensional layout system for the web. It lets you layout items in rows and columns, and has many features that make building complex layouts straightforward.</p>
        <h3>Grid Container and Grid Items</h3>
        <p>To create a grid container, you set the display property to grid or inline-grid. All direct children of the grid container become grid items automatically.</p>
        <pre><code>.container { display: grid; grid-template-columns: repeat(3, 1fr); }</code></pre>
        <h3>Defining Grid Areas</h3>
        <p>You can name grid areas and place items in them using the grid-template-areas property.</p>
      `,
      excerpt: "Learn how to create complex layouts with CSS Grid Layout.",
      coverImage: "https://images.unsplash.com/photo-1617040619263-41c5a9ca7521?w=800&auto=format&fit=crop",
      publishDate: "2023-06-05T14:45:00Z",
      status: "published",
      authorId: "author-2",
      authorName: "John Doe",
      categoryId: "cat-2",
      categoryName: "Design",
      tags: ["CSS", "Web Design", "Layout"],
      metaTitle: "Mastering CSS Grid Layout - Complete Guide",
      metaDescription: "Learn how to create complex layouts with CSS Grid Layout",
      metaKeywords: ["CSS", "Grid", "Layout", "Web Design"],
      createdAt: "2023-06-01T09:20:00Z",
      updatedAt: "2023-06-05T14:45:00Z",
      commentCount: 5,
      viewCount: 980
    },
    {
      id: "post-3",
      title: "SEO Strategies for 2023",
      slug: "seo-strategies-for-2023",
      content: `
        <h2>Latest SEO Trends</h2>
        <p>Search Engine Optimization continues to evolve with new algorithm updates and changing user behaviors. This article explores the most effective SEO strategies for 2023.</p>
        <h3>Core Web Vitals</h3>
        <p>Google's Core Web Vitals are a set of metrics related to speed, responsiveness, and visual stability. They are now key ranking factors that every website should optimize for.</p>
        <h3>E-A-T: Expertise, Authority, Trustworthiness</h3>
        <p>Google continues to emphasize E-A-T when evaluating content quality. Creating content that demonstrates expertise and builds trust is more important than ever.</p>
      `,
      excerpt: "Stay ahead of the competition with these effective SEO strategies for 2023.",
      coverImage: "https://images.unsplash.com/photo-1616469829941-a15b0d8117de?w=800&auto=format&fit=crop",
      publishDate: "2023-07-10T11:15:00Z",
      status: "published",
      authorId: "author-3",
      authorName: "Sarah Williams",
      categoryId: "cat-3",
      categoryName: "Marketing",
      tags: ["SEO", "Digital Marketing", "Content Strategy"],
      metaTitle: "SEO Strategies for 2023 - Stay Ahead of Algorithm Updates",
      metaDescription: "Discover effective SEO strategies to improve your website ranking in 2023",
      metaKeywords: ["SEO", "Search Engine Optimization", "Digital Marketing", "2023"],
      createdAt: "2023-07-05T13:40:00Z",
      updatedAt: "2023-07-10T11:15:00Z",
      commentCount: 12,
      viewCount: 1520
    }
  ];
  
  // Mock comments
  private mockComments: BlogComment[] = [
    {
      id: "comment-1",
      postId: "post-1",
      authorId: "user-1",
      authorName: "Alex Johnson",
      authorEmail: "alex@example.com",
      content: "Great article! The explanation of useState was very clear.",
      status: "approved",
      createdAt: "2023-05-16T09:30:00Z"
    },
    {
      id: "comment-2",
      postId: "post-1",
      authorId: "user-2",
      authorName: "Emma Davis",
      authorEmail: "emma@example.com",
      content: "I've been struggling with useEffect for a while. This helped a lot!",
      status: "approved",
      createdAt: "2023-05-17T14:15:00Z"
    },
    {
      id: "comment-3",
      postId: "post-2",
      authorId: "user-3",
      authorName: "Michael Brown",
      authorEmail: "michael@example.com",
      content: "CSS Grid has been a game-changer for my layouts. Thanks for the tips!",
      status: "approved",
      createdAt: "2023-06-06T10:45:00Z"
    }
  ];

  // Add the uploadImage method to the BlogService class
  async uploadImage(file: File): Promise<{ success: boolean; data: { url: string } }> {
    try {
      // Try API request first
      const formData = new FormData();
      formData.append('file', file);
      
      // Use the request method directly to pass headers in options
      const response = await EnhancedApiService.request<{ url: string }>(
        '/api/blog/upload',
        { 
          method: "POST", 
          data: formData,
          headers: { 
            'Content-Type': 'multipart/form-data' 
          },
          transformRequest: [(data) => data]
        }
      );
      
      if (response.success && response.data && response.data.url) {
        return { 
          success: true, 
          data: { url: response.data.url } 
        };
      } else {
        console.warn('Upload API request successful but no data:', response);
        
        // Create a local object URL as fallback
        const fakeUrl = URL.createObjectURL(file);
        return { 
          success: true, 
          data: { url: fakeUrl } 
        };
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Create a local object URL for preview when API fails
      const fakeUrl = URL.createObjectURL(file);
      return { 
        success: true, 
        data: { url: fakeUrl } 
      };
    }
  }

  // Get blog categories
  async getCategories(): Promise<{ success: boolean; data: BlogCategory[] }> {
    try {
      // Try API request first
      const apiResponse = await EnhancedApiService.get<{ content: BlogCategory[] }>('/api/blog/categories', {}, {
        content: []
      });
      
      if (apiResponse.success && apiResponse.data && apiResponse.data.content.length > 0) {
        return { 
          success: true, 
          data: apiResponse.data.content 
        };
      } else {
        // Return mock data if the API returned empty or failed
        return {
          success: true,
          data: this.mockCategories
        };
      }
    } catch (error) {
      console.info('Falling back to mock categories:', error);
      
      // Return mock data when API fails
      return {
        success: true,
        data: this.mockCategories
      };
    }
  }

  // Get blog tags
  async getTags(): Promise<{ success: boolean; data: BlogTag[] }> {
    try {
      // Try API request first
      const apiResponse = await EnhancedApiService.get<{ content: BlogTag[] }>('/api/blog/tags', {}, {
        content: []
      });
      
      if (apiResponse.success && apiResponse.data && apiResponse.data.content.length > 0) {
        return { 
          success: true, 
          data: apiResponse.data.content 
        };
      } else {
        // Return mock data if the API returned empty or failed
        return {
          success: true,
          data: this.mockTags
        };
      }
    } catch (error) {
      console.info('Falling back to mock tags:', error);
      
      // Return mock data when API fails
      return {
        success: true,
        data: this.mockTags
      };
    }
  }

  // Get comments for a blog post
  async getComments(postId: string): Promise<{ success: boolean; data: { content: BlogComment[] } }> {
    try {
      // Try API request first
      const apiResponse = await EnhancedApiService.get<{ content: BlogComment[] }>(
        `/api/blog/posts/${postId}/comments`, 
        {}, 
        { content: [] }
      );
      
      if (apiResponse.success && apiResponse.data && apiResponse.data.content.length > 0) {
        return apiResponse;
      } else {
        // Filter mock comments for this post if API returned empty or failed
        const filteredComments = this.mockComments.filter(comment => comment.postId === postId);
        
        return {
          success: true,
          data: { content: filteredComments }
        };
      }
    } catch (error) {
      console.info('Falling back to mock comments:', error);
      
      // Filter mock comments for this post when API fails
      const filteredComments = this.mockComments.filter(comment => comment.postId === postId);
      
      return {
        success: true,
        data: { content: filteredComments }
      };
    }
  }

  // Add a comment to a blog post
  async addComment(postId: string, commentData: Partial<BlogComment>) {
    return EnhancedApiService.post(`/api/blog/posts/${postId}/comments`, commentData);
  }

  // Get posts with optional filtering and pagination
  async getPosts(
    filters?: Record<string, any>, 
    page: number = 0, 
    pageSize: number = 10
  ): Promise<{ success: boolean; data: { content: BlogPost[], totalItems: number, totalPages: number } }> {
    try {
      // Try API request first
      const apiResponse = await EnhancedApiService.get<{ content: BlogPost[], totalItems: number, totalPages: number }>(
        '/api/blog/posts', 
        { ...filters, page, pageSiz }, 
        { content: [], totalItems: 0, totalPages: 0 },
      );
      
      if (apiResponse.success && apiResponse.data && apiResponse.data.content.length > 0) {
        return apiResponse;
      } else {
        // Process mock data if API returned empty or failed
        let filteredPosts = [...this.mockPosts];
        
        // Apply filters if provided
        if (filters) {
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredPosts = filteredPosts.filter(post => 
              post.title.toLowerCase().includes(searchTerm) || 
              post.content.toLowerCase().includes(searchTerm)
            );
          }
          
          if (filters.status) {
            filteredPosts = filteredPosts.filter(post => post.status === filters.status);
          }
          
          if (filters.category) {
            filteredPosts = filteredPosts.filter(post => 
              filters.category === 'all' ? true : post.categoryId === filters.category
            );
          }
        }
        
        // Apply pagination
        const start = page * pageSize;
        const end = start + pageSize;
        const paginatedPosts = filteredPosts.slice(start, end);
        
        return {
          success: true,
          data: {
            content: paginatedPosts,
            totalItems: filteredPosts.length,
            totalPages: Math.ceil(filteredPosts.length / pageSize)
          }
        };
      }
    } catch (error) {
      console.info('Falling back to mock posts:', error);
      
      // Process mock data when API fails
      const filteredPosts = [...this.mockPosts];
      const start = page * pageSize;
      const end = start + pageSize;
      const paginatedPosts = filteredPosts.slice(start, end);
      
      return {
        success: true,
        data: {
          content: paginatedPosts,
          totalItems: filteredPosts.length,
          totalPages: Math.ceil(filteredPosts.length / pageSize)
        }
      };
    }
  }

  // Create a new blog post
  async createPost(postData: any) {
    return EnhancedApiService.post('/api/blog/posts', postData);
  }

  // Update an existing blog post
  async updatePost(id: string, postData: any) {
    return EnhancedApiService.put(`/api/blog/posts/${id}`, postData);
  }

  // Get a single blog post by ID
  async getPost(id: string): Promise<{ success: boolean; data: BlogPost }> {
    try {
      // Try API request first
      const apiResponse = await EnhancedApiService.get<BlogPost>(`/api/blog/posts/${id}`);
      
      if (apiResponse.success && apiResponse.data) {
        return apiResponse;
      } else {
        // Find post in mock data if API failed or returned empty
        const post = this.mockPosts.find(post => post.id === id);
        
        if (post) {
          return {
            success: true,
            data: post
          };
        } else {
          return {
            success: false,
            data: {} as BlogPost
          };
        }
      }
    } catch (error) {
      console.info('Falling back to mock post data:', error);
      
      // Find post in mock data when API fails
      const post = this.mockPosts.find(post => post.id === id);
      
      if (post) {
        return {
          success: true,
          data: post
        };
      } else {
        return {
          success: false,
          data: {} as BlogPost
        };
      }
    }
  }

  // Delete a blog post
  async deletePost(id: string) {
    return EnhancedApiService.delete(`/api/blog/posts/${id}`);
  }

  // Create a new category
  async createCategory(categoryData: Partial<BlogCategory>) {
    return EnhancedApiService.post('/api/blog/categories', categoryData);
  }

  // Update a category
  async updateCategory(id: string, categoryData: Partial<BlogCategory>) {
    return EnhancedApiService.put(`/api/blog/categories/${id}`, categoryData);
  }

  // Delete a category
  async deleteCategory(id: string) {
    return EnhancedApiService.delete(`/api/blog/categories/${id}`);
  }

  // Create a new tag
  async createTag(tagData: Partial<BlogTag>) {
    return EnhancedApiService.post('/api/blog/tags', tagData);
  }

  // Update a tag
  async updateTag(id: string, tagData: Partial<BlogTag>) {
    return EnhancedApiService.put(`/api/blog/tags/${id}`, tagData);
  }

  // Delete a tag
  async deleteTag(id: string) {
    return EnhancedApiService.delete(`/api/blog/tags/${id}`);
  }
}

export default new BlogService();
