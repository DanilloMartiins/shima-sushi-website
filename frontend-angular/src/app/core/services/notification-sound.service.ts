import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationSoundService {
  private audioCtx: AudioContext | null = null;

  // O AudioContext só nasce depois de uma interação do usuário (política de
  // autoplay do navegador). Criação preguiçosa + resume pra garantir que toque.
  private getCtx(): AudioContext | null {
    if (!this.audioCtx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.audioCtx = new Ctor();
    }
    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Bip bip agudo, estilo notificação de app de delivery
  pedidoNovo(): void {
    const ctx = this.getCtx();
    if (!ctx) return;

    this.bip(ctx, 880, 0, 0.12);
    this.bip(ctx, 880, 0.18, 0.12);
  }

  // Um bip só, pra dar liberdade de usar em outro lugar se precisar
  bip(ctx: AudioContext, freq: number, delaySec: number, durSec: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + delaySec;

    osc.type = 'sine';
    osc.frequency.value = freq;

    // Envelope rápido pra não estourar o ouvido
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.4, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + durSec + 0.02);
  }
}