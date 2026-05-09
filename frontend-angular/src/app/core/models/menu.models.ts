export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  tag?: string | null;
  pitch?: string | null;
  categoryId: number;
  categoryTitle?: string | null;
}

export interface MenuCategoryResponse {
  id: number;
  title?: string; // Mantido como opcional caso algo ainda use
  name: string;
  description: string;
  products: ProductResponse[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  tag?: string;
  pitch?: string;
  categoryId: number;
}

export type UpdateProductRequest = CreateProductRequest;

export interface UploadImageResponse {
  url: string;
}
