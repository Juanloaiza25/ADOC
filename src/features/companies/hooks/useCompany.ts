import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyService } from '../services/companyService'
import { useAuthStore } from '@/app/store/useAuthStore'
import type { CreateCompanyInput, UpdateCompanyInput } from '@/shared/types/database'

export function useCompany(companyId: string | null | undefined) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.getById(companyId!),
    enabled: !!companyId,
  })

  const createMutation = useMutation({
    mutationFn: async (input: CreateCompanyInput) => {
      return companyService.create(input)
    },
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      queryClient.setQueryData(['company', company.id], company)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (updates: UpdateCompanyInput) =>
      companyService.update(companyId!, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['company', companyId], data)
      queryClient.invalidateQueries({ queryKey: ['company'] })
    },
  })

  return {
    company: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
