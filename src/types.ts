export interface User {
  id: number;
  username: string;
  password_hash: string;
  name: string;
  email: string | null;
  google_id: string | null;
  avatar_url: string | null;
  role: "pending" | "member" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export interface ProgressEntry {
  id: number;
  user_id: number;
  last_page: number;
  completed: number;
  created_at: string;
  updated_at: string;
}

export interface ProgressLog {
  id: number;
  user_id: number;
  page_from: number;
  page_to: number;
  logged_at: string;
}

export interface RankedUser {
  id: number;
  name: string;
  avatar_url: string | null;
  rank: number;
  total_memorized: number;
  cycle: number;
  target: number;
  progress_percent: number;
  current_surah: string;
  current_surah_number: number;
  current_ayah: number;
  current_juz?: number;
  trend: number;
  joined_label: string;
}

export type Env = {
  Variables: {
    user: User;
  };
};
