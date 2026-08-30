import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/app/store/useAuthStore'
import { profileService } from '../services/profileService'

export function useProfile() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => profileService.getById(user!.id),
    enabled: !!user?.id,
  })

  const updateMutation = useMutation({
    mutationFn: (updates: Parameters<typeof profileService.update>[1]) =>
      profileService.update(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
  })

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
