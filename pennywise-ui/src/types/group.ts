export interface Group {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
}

export interface GroupCreate {
  name: string;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role: string;
  joined_at: string;
} 