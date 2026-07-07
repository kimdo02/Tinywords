export type UUID = string;

export type WordStatus = "learning" | "mastered";

export interface Profile {
  id: UUID;
  owner: UUID;
  name: string;
  avatar: string | null;
  created_at: string;
}

export interface Word {
  id: UUID;
  profile_id: UUID;
  term: string;
  meaning: string;
  alt_meanings: string[] | null;
  example: string | null;
  image_url: string | null;
  emoji: string | null;
  category: string | null;
  difficulty: number;
  wrong_count: number;
  correct_count: number;
  streak: number;
  status: WordStatus;
  last_reviewed_at: string | null;
  created_at: string;
}

export interface TestResult {
  id: UUID;
  profile_id: UUID;
  taken_at: string;
  total: number;
  correct: number;
  wrong_word_ids: UUID[];
}

export interface AccountSettings {
  owner: UUID;
  pin_hash: string | null;
  tts_voice: string | null;
  tts_rate: number;
  tts_pitch: number;
  default_test_count: number;
  session_size: number;
}
