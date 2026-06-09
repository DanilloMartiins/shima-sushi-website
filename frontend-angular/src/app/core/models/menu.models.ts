export interface CategorySummaryResponse {
  id: number;
  name: string;
}

export interface CustomizationOptionResponse {
  id: number;
  name: string;
  priceAddition: number;
  displayOrder: number;
}

export interface CustomizationGroupResponse {
  id: number;
  name: string;
  minSelected: number;
  maxSelected: number;
  displayOrder: number;
  options: CustomizationOptionResponse[];
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  available?: boolean;
  isFeatured?: boolean;
  isCustomizable?: boolean;
  customizationGroups?: CustomizationGroupResponse[];
  category?: CategorySummaryResponse;
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
  isCustomizable?: boolean;
  customizationGroups?: CustomizationGroupResponse[];
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

export interface CustomizationOptionRequest {
  id?: number;
  name: string;
  priceAddition: number;
  displayOrder: number;
}

export interface CustomizationGroupRequest {
  id?: number;
  name: string;
  minSelected: number;
  maxSelected: number;
  displayOrder: number;
  options: CustomizationOptionRequest[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  categoryId: number;
  isCustomizable: boolean;
  customizationGroups: CustomizationGroupRequest[];
}

export type UpdateProductRequest = CreateProductRequest;

export interface UploadImageResponse {
  productId: number;
  imageUrl: string;
  message: string;
}
