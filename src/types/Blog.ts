
// Create this file if it doesn't exist
import { ReactElement } from 'react';

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
  author?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogCategory {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
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
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}
