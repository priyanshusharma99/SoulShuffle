import api from './api';

// ── Types ────────────────────────────────────────────────
export type ExpiryType = '7_DAYS' | '30_DAYS' | '1_YEAR';
export type RoomStatus = 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

export interface Room {
  id: string;
  code: string;
  host_id: string;
  partner_id: string | null;
  expiry_type: ExpiryType;
  expires_at: string;
  status: RoomStatus;
  game_state?: {
    active_challenge?: SentChallenge;
    challenge_history?: SentChallenge[];
  };
  created_at: string;
}

export interface ChallengePayload {
  id: number | string;
  title: string;
  category: string;
  difficulty: string;
  time: string;
  image: any;
  description?: string;
}

export interface SentChallenge extends ChallengePayload {
  sender_id?: string;
  status?: string;
  sent_at?: string;
}

// ── CREATE ROOM ──────────────────────────────────────────
export const createRoom = async (expiryType: ExpiryType = '7_DAYS'): Promise<Room> => {
  const response = await api.post('/rooms/create', { expiry_type: expiryType });
  return response.data.data.room;
};

// ── JOIN ROOM ────────────────────────────────────────────
export const joinRoom = async (code: string): Promise<Room> => {
  const response = await api.post('/rooms/join', { code: code.toUpperCase() });
  return response.data.data.room;
};

// ── GET ACTIVE ROOM ──────────────────────────────────────
export const getActiveRoom = async (): Promise<Room | null> => {
  try {
    const response = await api.get('/rooms/active');
    return response.data.data.room;
  } catch (error: any) {
    // 404 means no active room — that's normal, not an error
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// ── SEND CHALLENGE ──────────────────────────────────────
export const sendChallenge = async (challenge: ChallengePayload) => {
  const response = await api.post('/rooms/challenge', { challenge });
  return response.data.data;
};
