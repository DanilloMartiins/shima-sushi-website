export interface AddressRequest {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  referencePoint?: string;
  isDefault: boolean;
}

export interface AddressResponse {
  id: number;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  complement?: string;
  referencePoint?: string;
  isDefault: boolean;
  createdAt: string;
}
