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
  // When the address was confirmed from the emailed link; null until then.
  email_verified_at: string | null;
}
export interface AuthResponse {
  user: UserRead;
  tokens: TokenPair;
}
export type OAuthProvider = "google" | "linkedin";
