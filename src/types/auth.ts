import type { User } from '@supabase/supabase-js'

export type { User }

export type AuthProvider = 'google'

export type AuthError = 'oauth_failed' | 'session_expired' | 'unknown'

export const AUTH_ERROR_CODES: readonly AuthError[] = [
  'oauth_failed',
  'session_expired',
  'unknown',
] as const

export interface AuthErrorInfo {
  code: AuthError
  message: string
}
