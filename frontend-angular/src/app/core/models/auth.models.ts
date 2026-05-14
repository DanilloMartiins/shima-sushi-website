export type RoleName = 'ADMIN' | 'CUSTOMER';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ClerkUser {
  id: string;
  fullName: string | null;
  imageUrl?: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  primaryPhoneNumber?: { phoneNumber: string } | null;
  publicMetadata: {
    cpf?: string;
    [key: string]: any;
  };
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  role: RoleName | null;
  email: string | null;
  expiresAt: number;
}
