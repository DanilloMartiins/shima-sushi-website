export interface BusinessHoursDay {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda ...
  enabled: boolean;
  openTime: string; // "HH:mm"
  closeTime: string; // "HH:mm"
}

export interface PaymentMethodsConfig {
  cash: boolean;
  pix: boolean;
  creditCard: boolean;
  debitCard: boolean;
  mealVoucher: boolean;
}

export interface StoreProfileConfig {
  logoUrl: string;
  coverUrl: string;
  addressStreet: string;
  addressNumber: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  referencePoint: string;
}

export interface StoreSettingsResponse {
  id: number;
  storeOpen: boolean;
  openingMessage: string;
  closingMessage: string;
  whatsappNumber: string;
  deliveryFee: number;
  minimumOrderValue: number;
  businessHours: BusinessHoursDay[];
  paymentMethods: PaymentMethodsConfig;
  estimatedDeliveryTime: string;
  storeProfile: StoreProfileConfig;
}

export interface UpdateStoreSettingsRequest {
  storeOpen: boolean;
  openingMessage: string;
  closingMessage: string;
  whatsappNumber: string;
  deliveryFee: number;
  minimumOrderValue: number;
  businessHours: BusinessHoursDay[];
  paymentMethods: PaymentMethodsConfig;
  estimatedDeliveryTime: string;
  storeProfile: StoreProfileConfig;
}

export const DAY_LABELS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const DEFAULT_BUSINESS_HOURS: BusinessHoursDay[] = [
  { dayOfWeek: 0, enabled: true, openTime: '18:00', closeTime: '23:00' },
  { dayOfWeek: 1, enabled: false, openTime: '18:00', closeTime: '23:00' },
  { dayOfWeek: 2, enabled: false, openTime: '18:00', closeTime: '23:00' },
  { dayOfWeek: 3, enabled: true, openTime: '18:00', closeTime: '23:00' },
  { dayOfWeek: 4, enabled: true, openTime: '18:00', closeTime: '23:00' },
  { dayOfWeek: 5, enabled: true, openTime: '18:00', closeTime: '23:30' },
  { dayOfWeek: 6, enabled: true, openTime: '18:00', closeTime: '23:30' },
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethodsConfig = {
  cash: true,
  pix: true,
  creditCard: true,
  debitCard: true,
  mealVoucher: false,
};

export interface StoreStatusSnapshot {
  isOpenNow: boolean;
  statusLabel: string;
  detailLabel: string;
}
