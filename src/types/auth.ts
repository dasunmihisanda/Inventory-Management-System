export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'Administrator' | 'Inventory Manager' | 'Auditor' | 'Stores Lead';
  authProvider: 'google';
  lastLogin: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  loginWithMockGoogle: (email?: string, name?: string, role?: UserProfile['role']) => void;
  logout: () => void;
  googleClientId: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}
