export interface StoreSettingsResponse {
  id: number;
  storeOpen: boolean;
  openingMessage: string;
  closingMessage: string;
  whatsappNumber: string;
  deliveryFee: number;
  minimumOrderValue: number;
}

export interface UpdateStoreSettingsRequest {
  storeOpen: boolean;
  openingMessage: string;
  closingMessage: string;
  whatsappNumber: string;
  deliveryFee: number;
  minimumOrderValue: number;
}

export interface StoreStatusSnapshot {
  isOpenNow: boolean;
  statusLabel: string;
  detailLabel: string;
}
