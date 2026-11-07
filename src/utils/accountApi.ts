import { UserProfile } from '../types';

export interface AccountUser {
  nickname: string;
}

interface ApiResponse {
  authenticated?: boolean;
  user?: AccountUser;
  profile?: UserProfile;
  error?: string;
}

async function request(
  action: string,
  body?: Record<string, unknown>,
): Promise<ApiResponse> {
  const response = await fetch(`/api/index.php?action=${encodeURIComponent(action)}`, {
    method: body ? 'POST' : 'GET',
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json().catch(() => null) as ApiResponse | null;
  if (!response.ok) {
    throw new Error(result?.error || 'A kérés nem sikerült. Próbáld újra később.');
  }
  if (!result) {
    throw new Error('A szerver érvénytelen választ küldött.');
  }
  return result;
}

export const accountApi = {
  async current(): Promise<ApiResponse> {
    return request('me');
  },

  async login(nickname: string, password: string): Promise<ApiResponse> {
    return request('login', { nickname, password });
  },

  async register(
    nickname: string,
    password: string,
    profile: UserProfile,
  ): Promise<ApiResponse> {
    return request('register', { nickname, password, profile });
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    await request('save-profile', { profile });
  },

  async logout(): Promise<void> {
    await request('logout', {});
  },
};
