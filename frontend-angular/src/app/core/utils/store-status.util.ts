import { StoreSettingsResponse, StoreStatusSnapshot } from '../models/store.models';

function getCurrentDayHours(settings: StoreSettingsResponse) {
  const hoje = new Date().getDay();
  return settings.businessHours?.find((d) => d.dayOfWeek === hoje);
}

function isWithinHours(openTime: string, closeTime: string): boolean {
  const agora = new Date();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  const minutosAbertura = oh * 60 + om;
  const minutosFechamento = ch * 60 + cm;

  if (minutosFechamento < minutosAbertura) {
    // Vira o dia (ex: abre 18h, fecha 2h)
    return minutosAgora >= minutosAbertura || minutosAgora < minutosFechamento;
  }

  return minutosAgora >= minutosAbertura && minutosAgora < minutosFechamento;
}

export function buildStoreStatus(settings: StoreSettingsResponse | null): StoreStatusSnapshot {
  if (!settings) {
    return {
      isOpenNow: false,
      statusLabel: 'Indisponível',
      detailLabel: 'Sem dados de funcionamento.',
    };
  }

  // Se o toggle manual desligou, fecha independente do horário
  if (!settings.storeOpen) {
    return {
      isOpenNow: false,
      statusLabel: 'Fechado agora',
      detailLabel: settings.closingMessage || 'Voltamos em breve.',
    };
  }

  // Se não tem businessHours configurado (backend antigo), usa só o toggle manual
  if (!settings.businessHours?.length) {
    return {
      isOpenNow: true,
      statusLabel: 'Aberto agora',
      detailLabel: settings.openingMessage || 'Atendendo agora!',
    };
  }

  // Verifica horário automático
  const hoje = getCurrentDayHours(settings);

  if (hoje?.enabled && isWithinHours(hoje.openTime, hoje.closeTime)) {
    return {
      isOpenNow: true,
      statusLabel: 'Aberto agora',
      detailLabel: settings.openingMessage || 'Atendendo agora!',
    };
  }

  // Se tem horário configurado mas está fora do horário
  if (hoje?.enabled) {
    return {
      isOpenNow: false,
      statusLabel: 'Fechado agora',
      detailLabel: `Voltamos ${hoje.openTime}h!`,
    };
  }

  // Dia desabilitado
  return {
    isOpenNow: false,
    statusLabel: 'Fechado agora',
    detailLabel: settings.closingMessage || 'Voltamos em breve.',
  };
}
