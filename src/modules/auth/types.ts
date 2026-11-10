export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  isSuperAdmin: boolean;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
}
