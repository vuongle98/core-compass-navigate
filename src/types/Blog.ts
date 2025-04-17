
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  publishDate: string;
  status: 'draft' | 'published' | 'scheduled';
  authorId: string;
  authorName: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  viewCount: number;
}

export interface BlogComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  parentId?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  color?: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  color?: string;
}

export interface BlogMedia {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  uploadDate: string;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
}

export interface RichTextEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  className?: string;
  allowImageUpload?: boolean;
  onImageUpload?: (file: File) => Promise<{ url: string }>;
}
