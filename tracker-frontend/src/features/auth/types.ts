// types.ts
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
export interface UserRead {
  id: string;
  email: string | null;
  full_name: string | null;
  is_anonymous: boolean;
  is_active: boolean;
  created_at: string;
}
export interface AuthResponse {
  user: UserRead;
  tokens: TokenPair;
}
export type OAuthProvider = "google" | "linkedin";
