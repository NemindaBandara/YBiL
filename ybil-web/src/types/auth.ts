export interface UserProfile {
  id: string;
  username: string;
  role: 'PASSENGER' | 'ADMIN' | 'CONDUCTOR';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
}