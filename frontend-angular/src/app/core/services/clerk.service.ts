import { Injectable, signal } from '@angular/core';
import { ptBR } from '@clerk/localizations';
import { ClerkUser } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class ClerkService {
  private readonly publishableKey = 'pk_test_aW5mb3JtZWQtaGFkZG9jay01MC5jbGVyay5hY2NvdW50cy5kZXYk';
  private readonly instanceUrl = 'informed-haddock-50.clerk.accounts.dev';
  
  private clerk: any = null;
  readonly loaded = signal(false);
  readonly user = signal<ClerkUser | null>(null);
  private inactivityTimeout: any;
  private readonly INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutos

  async init(): Promise<void> {
    if (this.clerk || (window as any).Clerk) {
      this.clerk = (window as any).Clerk;
      this.loaded.set(true);
      this.setupInactivityListener();
      return;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.setAttribute('data-clerk-publishable-key', this.publishableKey);
      script.async = true;
      script.src = `https://${this.instanceUrl}/npm/@clerk/clerk-js@5/dist/clerk.browser.js`;
      
      script.onload = async () => {
        this.clerk = (window as any).Clerk;
        try {
          await this.clerk.load({
            localization: ptBR,
          });
          
          this.user.set(this.clerk.user);
          this.loaded.set(true);
          
          if (this.clerk.user) {
            this.setupInactivityListener();
          }

          this.clerk.addListener((resources: any) => {
            this.user.set(resources.user);
            if (resources.user) {
              this.setupInactivityListener();
            } else {
              this.clearInactivityListener();
            }
          });
          resolve();
        } catch (err) {
          console.error('Erro ao inicializar Clerk:', err);
        }
      };

      document.body.appendChild(script);
    });
  }

  private setupInactivityListener(): void {
    this.resetInactivityTimeout();
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimeout());
    });
  }

  private clearInactivityListener(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
  }

  private resetInactivityTimeout(): void {
    this.clearInactivityListener();
    if (this.user()) {
      this.inactivityTimeout = setTimeout(() => {
        console.log('Sessão expirada por inatividade.');
        this.signOut();
      }, this.INACTIVITY_TIME);
    }
  }

  mountSignIn(containerId: string): void {
    const el = document.getElementById(containerId);
    if (!el || !this.clerk) return;

    if (this.loaded()) {
      this.clerk.mountSignIn(el, {
        forceRedirectUrl: '/',
        fallbackRedirectUrl: '/'
      });
    } else {
      setTimeout(() => this.mountSignIn(containerId), 500);
    }
  }

  mountSignUp(containerId: string): void {
    const el = document.getElementById(containerId);
    if (!el || !this.clerk) return;

    if (this.loaded()) {
      this.clerk.mountSignUp(el, {
        forceRedirectUrl: '/',
        fallbackRedirectUrl: '/'
      });
    } else {
      setTimeout(() => this.mountSignUp(containerId), 500);
    }
  }

  mountUserProfile(containerId: string): void {
    const el = document.getElementById(containerId);
    if (!el || !this.clerk) return;
    if (this.loaded()) {
      this.clerk.mountUserProfile(el);
    } else {
      setTimeout(() => this.mountUserProfile(containerId), 500);
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.clerk?.session) return null;
    return await this.clerk.session.getToken();
  }

  async signOut(): Promise<void> {
    await this.clerk?.signOut();
    this.user.set(null);
  }
}
