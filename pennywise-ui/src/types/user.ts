export interface User {
  id: number;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  auth_provider: string;
  is_active: boolean;
  is_superuser: boolean;
} 