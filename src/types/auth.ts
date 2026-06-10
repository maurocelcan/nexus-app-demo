import type { WorkspaceRole } from "./workspace";

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  workspaceRole?: WorkspaceRole;
  enabledModules?: string[];
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  company: string;
  role: string;
  password: string;
  confirmPassword: string;
}
