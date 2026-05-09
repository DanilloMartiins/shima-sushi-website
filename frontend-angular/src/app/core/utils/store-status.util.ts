import { StoreSettingsResponse, StoreStatusSnapshot } from '../models/store.models';

export function buildStoreStatus(settings: StoreSettingsResponse | null): StoreStatusSnapshot {
  if (!settings) {
    return {
      isOpenNow: false,
      statusLabel: 'Indisponivel',
      detailLabel: 'Sem dados de funcionamento.',
    };
  }

  // O backend já nos diz se a loja está aberta ou não via flag storeOpen
  const isOpen = settings.storeOpen;

  if (isOpen) {
    return {
      isOpenNow: true,
      statusLabel: 'Aberto agora',
      detailLabel: settings.openingMessage || 'Atendendo agora!',
    };
  }

  return {
    isOpenNow: false,
    statusLabel: 'Fechado agora',
    detailLabel: settings.closingMessage || 'Voltamos em breve.',
  };
}
