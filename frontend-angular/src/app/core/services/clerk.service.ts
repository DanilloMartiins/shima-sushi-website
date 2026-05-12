import { Injectable, signal } from '@angular/core';
import { Clerk } from '@clerk/clerk-js';

@Injectable({
  providedIn: 'root',
})
export class ClerkService {
  // A Publishable Key deve vir do seu dashboard do Clerk
  private readonly publishableKey = 'pk_test_aW5mb3JtZWQtaGFkZG9jay01MC5jbGVyay5hY2NvdW50cy5kZXYk';
  private clerk: Clerk | null = null;

  readonly loaded = signal(false);
  readonly user = signal<any>(null);

  async init(): Promise<void> {
    if (this.clerk) return;

    this.clerk = new Clerk(this.publishableKey);

    try {
      await this.clerk.load();
      this.loaded.set(true);
      this.user.set(this.clerk.user);
    } catch (err) {
      console.error('Erro ao carregar o Clerk:', err);
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

  openSignIn(): void {
    this.clerk?.openSignIn();
  }

  openSignUp(): void {
    this.clerk?.openSignUp();
  }
}
