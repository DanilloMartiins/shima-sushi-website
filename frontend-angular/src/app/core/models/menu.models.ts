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
  category?: CategorySummaryResponse;
  // Campos opcionais usados em outras partes do front
  tag?: string;
  pitch?: string;
  dataAtualizacao?: string;
}

export interface MenuCategoryResponse {
  id: number;
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
