export interface FileItem {
  id: number;
  name: string;
  size: number;
  contentType: string;
  extension: string;
  createdAt: string;
  updatedAt?: string;
  path: string;
}
