export interface ProductResponse {
  id: number;
  nome: string;
  preco: number;
  urlImagem?: string | null;
  dataAtualizacao: string;
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
