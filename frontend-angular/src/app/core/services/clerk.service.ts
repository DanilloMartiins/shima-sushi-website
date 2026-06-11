import { Injectable, signal } from '@angular/core';
import { ptBR } from '@clerk/localizations';
import { ClerkUser } from '../models/auth.models';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class ClerkService {
  private readonly publishableKey = 'pk_test_aW5mb3JtZWQtaGFkZG9jay01MC5jbGVyay5hY2NvdW50cy5kZXYk';
  private readonly instanceUrl = 'informed-haddock-50.clerk.accounts.dev';

  private readonly SESSION_TIMESTAMP_KEY = 'seu-shima-sushi-session-ts';
  private readonly SESSION_SESSION_KEY = 'seu-shima-sushi-session-active';
  private readonly SESSION_MIGRATED_KEY = 'seu-shima-sushi-migrated';

  private clerk: any = null;
  readonly loaded = signal(false);
  readonly user = signal<ClerkUser | null>(null);
  readonly backendRole = signal<string | null>(null);
  private inactivityTimeout: any;
  private readonly INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutos

  async init(): Promise<void> {
    if (this.clerk || (window as any).Clerk) {
      this.clerk = (window as any).Clerk;
      this.loaded.set(true);
      this.setupInactivityListener();
      return;
    }

    // Salva o timestamp quando o navegador for fechado/PC desligar
    window.addEventListener('beforeunload', () => {
      this.salvarTimestampSessao();
    });

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.setAttribute('data-clerk-publishable-key', this.publishableKey);
      script.async = true;
      script.src = `https://${this.instanceUrl}/npm/@clerk/clerk-js@5/dist/clerk.browser.js`;
      
      script.onload = async () => {
        this.clerk = (window as any).Clerk;
        this.marcarSessaoAtiva();
        try {
          await this.clerk.load({
            localization: ptBR,
          });
          
          this.user.set(this.clerk.user);
          this.loaded.set(true);

          if (this.clerk.user) {
            // Se tem sessao mas a flag de migracao nao existe,
            // eh a primeira execucao apos o deploy dessa logica
            if (!localStorage.getItem(this.SESSION_MIGRATED_KEY)) {
              localStorage.setItem(this.SESSION_MIGRATED_KEY, '1');
            } else if (!this.temSessaoAtiva()) {
              // Ja passou pela migracao, sessionStorage vazio = fechou navegador
              console.log('Navegador foi fechado. Encerrando sessao.');
              await this.signOut();
              resolve();
              return;
            }

            if (this.user()) {
              this.setupInactivityListener();
              void this.fetchBackendRole();
            }
          }

          this.clerk.addListener((resources: any) => {
            this.user.set(resources.user);
            if (resources.user) {
              this.marcarSessaoAtiva();
              this.setupInactivityListener();
              void this.fetchBackendRole();
            } else {
              this.limparSessaoAtiva();
              this.clearInactivityListener();
              this.backendRole.set(null);
            }
          });

          if (this.clerk.user) {
            this.marcarSessaoAtiva();
          }

          resolve();
        } catch (err) {
          console.error('Erro ao inicializar Clerk:', err);
        }
      };

      document.body.appendChild(script);
    });
  }

  private salvarTimestampSessao(): void {
    localStorage.setItem(this.SESSION_TIMESTAMP_KEY, Date.now().toString());
  }

  private marcarSessaoAtiva(): void {
    sessionStorage.setItem(this.SESSION_SESSION_KEY, '1');
  }

  private temSessaoAtiva(): boolean {
    return sessionStorage.getItem(this.SESSION_SESSION_KEY) === '1';
  }

  private limparSessaoAtiva(): void {
    sessionStorage.removeItem(this.SESSION_SESSION_KEY);
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
        fallbackRedirectUrl: '/',
        appearance: {
          elements: {
            footerAction: { display: 'none' }
          }
        }
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
        fallbackRedirectUrl: '/',
        appearance: {
          elements: {
            footerAction: { display: 'none' }
          }
        }
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
    this.backendRole.set(null);
    this.limparSessaoAtiva();
    localStorage.removeItem(this.SESSION_TIMESTAMP_KEY);
  }

  /*
   * Busca a role do usuario logado direto do backend (fonte da verdade)
   */
  async fetchBackendRole(): Promise<string | null> {
    const token = await this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      this.backendRole.set(data.role);
      return data.role;
    } catch {
      return null;
    }
  }

  /*
   * Checa se o usuario tem role ADMIN ou SUPER_ADMIN
   * Prioriza a role do backend (sempre atualizada), fallback pro Clerk metadata
   */
  isUserAdmin(): boolean {
    const bRole = this.backendRole();
    if (bRole === 'ADMIN' || bRole === 'SUPER_ADMIN') {
      return true;
    }

    const u = this.user();
    if (!u) {
      return false;
    }
    const role = u.publicMetadata?.['role'];
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return true;
    }
    return u.primaryEmailAddress?.emailAddress === 'admin@seushimasushi.com';
  }

  /*
   * Checa se o usuario tem role SUPER_ADMIN
   * Prioriza o backend, fallback pro Clerk metadata
   */
  isUserSuperAdmin(): boolean {
    if (this.backendRole() === 'SUPER_ADMIN') {
      return true;
    }

    const u = this.user();
    if (!u) {
      return false;
    }
    return u.publicMetadata?.['role'] === 'SUPER_ADMIN';
  }
}
