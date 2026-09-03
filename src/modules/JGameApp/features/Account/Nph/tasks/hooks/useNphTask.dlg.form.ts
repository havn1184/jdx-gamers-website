/**
 * useNphTaskForm — Form tạo/sửa nhiệm vụ của chính NPH. Reset state khi `initialData` đổi (dialog không
 * unmount khi đóng — hook-conventions/SKILL.md).
 */
import { useCallback, useEffect, useState } from 'react'
import { NphApiService } from '../../services'
import type { NphTask, NphTaskFormPayload, NphTaskRequirementType } from '../../types'

const EMPTY_FORM: NphTaskFormPayload = {
  title: '',
  description: '',
  requirementType: 'level',
  requirementTargetValue: 1,
  requirementHoursPerDay: null,
  requirementItemNames: [],
  rewardJcoin: 0,
  slotLimit: 0,
  endAt: null,
  gameAndroidUrl: null,
  gameIosUrl: null,
}

function buildInitial(task: NphTask | null): NphTaskFormPayload {
  if (!task) return { ...EMPTY_FORM }
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    requirementType: task.requirementType,
    requirementTargetValue: task.requirementTargetValue,
    requirementHoursPerDay: task.requirementHoursPerDay,
    requirementItemNames: task.requirementItemNames,
    rewardJcoin: task.rewardJcoin,
    slotLimit: task.slotLimit,
    endAt: task.endAt,
    gameAndroidUrl: task.gameAndroidUrl,
    gameIosUrl: task.gameIosUrl,
  }
}

export function useNphTaskForm({ initialData, onSuccess }: { initialData: NphTask | null; onSuccess: () => void }) {
  const [formData, setFormData] = useState<NphTaskFormPayload>(() => buildInitial(initialData))
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setFormData(buildInitial(initialData))
    setErrorMessage(null)
  }, [initialData])

  const isValid = formData.title.trim().length > 0 && formData.requirementTargetValue > 0 && formData.rewardJcoin >= 0 && formData.slotLimit >= 0

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return
    setSubmitting(true)
    setErrorMessage(null)
    const result = formData.id
      ? await NphApiService.updateTask(formData.id, formData)
      : await NphApiService.createTask(formData)
    setSubmitting(false)
    if (!result.success) {
      setErrorMessage(result.message || 'Lưu nhiệm vụ thất bại.')
      return
    }
    onSuccess()
  }, [formData, isValid, submitting, onSuccess])

  const setRequirementType = useCallback((type: NphTaskRequirementType) => {
    setFormData(prev => ({ ...prev, requirementType: type }))
  }, [])

  return { formData, setFormData, setRequirementType, isValid, submitting, errorMessage, handleSubmit }
}
