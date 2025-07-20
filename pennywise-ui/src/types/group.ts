export interface Group {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface GroupCreate {
  name: string;
}

export interface GroupMember {
  user_id: number;
  role: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
} 