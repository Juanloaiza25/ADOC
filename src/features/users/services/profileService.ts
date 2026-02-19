import { supabase } from '@/lib/supabase'
import type { Profile } from '@/shared/types/database'

export const profileService = {
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Profile
  },

  async getByAuthUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return this.getById(user.id)
  },

  async update(id: string, updates: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'company_id' | 'role'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Profile
  },

  async setCompany(userId: string, companyId: string, role: Profile['role'] = 'owner') {
    return this.update(userId, { company_id: companyId, role })
  },
}
