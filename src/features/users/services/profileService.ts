import { apiRequest } from '@/lib/api'
import type { Profile } from '@/shared/types/database'

export const profileService = {
  async getById(id: string): Promise<Profile | null> {
    void id
    const { profile } = await apiRequest<{ profile: Profile | null }>('/api/profile')
    return profile
  },

  async getByAuthUser() {
    const { profile } = await apiRequest<{ profile: Profile | null }>('/api/profile')
    return profile
  },

  async update(id: string, updates: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>) {
    void id
    await apiRequest('/api/profile', { method: 'PATCH', body: JSON.stringify(updates) })
    return (await this.getById(id))!
  },
}
