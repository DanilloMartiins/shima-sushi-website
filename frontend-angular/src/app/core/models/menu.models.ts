export interface CategorySummaryResponse {
  id: number;
  name: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  available?: boolean;
  isFeatured?: boolean;
  category?: CategorySummaryResponse;
  // Campos opcionais usados em outras partes do front
  tag?: string;
  pitch?: string;
  dataAtualizacao?: string;
}

export interface FeaturedProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface MenuCategoryResponse {
  id: number;
  name: string;
  description: string;
  products: ProductResponse[];
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  categoryId: number;
}

export type UpdateProductRequest = CreateProductRequest;

export interface UploadImageResponse {
  productId: number;
  imageUrl: string;
  message: string;
}
