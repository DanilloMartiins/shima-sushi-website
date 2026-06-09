export interface SelectedOption {
  groupId: number;
  groupName: string;
  optionId: number;
  optionName: string;
  priceAddition: number;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  selectedOptions?: SelectedOption[];
  customKey?: string;
}
