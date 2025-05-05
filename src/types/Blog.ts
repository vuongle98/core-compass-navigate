import { User } from "./Auth";

export interface BlogPost {
  id?: number;
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: number | string;
  category?: BlogCategory;
  tags?: string[];
  featuredImage?: string;
  isPublished?: boolean;
  slug?: string;
  author?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogCategory {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  postCount?: number;
}

export interface BlogTag {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  postCount?: number;
}

export interface RichTextEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  className?: string;
  allowImageUpload?: boolean;
  onImageUpload?: (file: File) => Promise<any>;
}

export interface BlogPostFormProps {
  initialData?: BlogPost;
  onSubmit: (data: Partial<BlogPost>) => Promise<void>;
  isLoading?: boolean;
}
