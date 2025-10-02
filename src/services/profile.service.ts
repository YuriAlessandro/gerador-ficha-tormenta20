import api from './api';

export interface PublicProfile {
  username: string;
  fullName?: string;
  photoURL?: string;
  isPremium: boolean;
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
