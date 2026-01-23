import api from './api';
import { SupportLevel } from '../types/subscription.types';

export interface PublicProfile {
  username: string;
  fullName?: string;
  photoURL?: string;
  supportLevel: SupportLevel;
  isPremium: boolean; // Keep for backward compatibility
  createdAt: Date;
  totalSheets: number;
}

class ProfileService {
  static async getProfileByUsername(username: string): Promise<PublicProfile> {
    const { data } = await api.get<{ user: PublicProfile }>(
      `/api/auth/profile/${username}`
    );
    return data.user;
  }
}

export default ProfileService;
