import { UserState } from '../user/user.types';

export interface AuthState {
  token: string | null;
  authed: boolean,
  phoneVerfication?: {
    isVerified?: boolean,
    requestId?: string,
    code?: string
  }
}

export interface AuthResponse {
  requestId: any;
  authToken: string,
  user: UserState,
  welcomeMessage?: string,
  errors: any;      // json map
}
