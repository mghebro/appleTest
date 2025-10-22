export interface AppleName {
  firstName: string;
  lastName: string;
}

export interface AppleUserData {
  name?: AppleName;
  email?: string;
}

export interface AppleSignInRequest {
  idToken: string;
  code?: string;
  user?: AppleUserData;
}

export interface LoginResponse {
  refreshToken: any;
  accessToken: any;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  authProvider: string;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: AppleSignInConfig) => void;
        signIn: () => Promise<AppleSignInResponse>;
      };
    };
  }
}

export interface AppleSignInConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  state?: string;
  usePopup: boolean;
}

export interface AppleSignInResponse {
  authorization: {
    code: string;
    id_token: string;
    state?: string;
  };
  user?: {
    email?: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  };
}
