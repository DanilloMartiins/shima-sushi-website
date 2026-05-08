// Modelos de dados centrais para a feature de Menu.

export interface Product {
  id: number;
  categoryId: number;
  categoryTitle: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  tag?: string;
  pitch?: string;
}

export interface MenuCategory {
  id:number;
  title: string;
  items: Product[];
}