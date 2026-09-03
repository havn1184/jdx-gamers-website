/**
 * NphApiService — Toàn bộ API tự phục vụ của NPH (`/api/publisher/*`), gọi qua `nphApiCall` (token
 * riêng, không dùng chung `apiCall()` của Customer/Admin). Map response thô (enum int/DTO Backend
 * thật) sang types FE tiện dùng — xem `Backend/JGameApi/Controllers/PublisherPortalController.cs`.
 */
import { buildJGameUrl } from '../../../../shared/services/api'
import type { ApiResponse } from '../../../../shared/services/api'
import { nphApiCall } from './nphApiCall'
import {
  NPH_HOLD_STATUS_MAP, NPH_TASK_REQUIREMENT_TYPE_MAP, NPH_TASK_STATUS_MAP,
} from '../types'
import type {
  NphDashboard, NphTask, NphTaskFormPayload, NphTransaction, NphWallet, NphTopup, NphWebhookSecretResult,
  NphHoldStatus, NphTaskRequirementType, NphTaskStatus,
} from '../types'

// ===== DTO thô từ Backend (enum vẫn là int — chưa map) =====

interface GameTaskResponseDto {
  id: string
  title: string
  publisherName: string
  publisherId: string | null
  requirementType: number
  requirementTargetValue: number
  requirementHoursPerDay: number | null
  requirementItemNames: string[]
  requirementSummary: string
  description: string
  rewardJcoin: number
  slotLimit: number
  slotUsed: number
  slotsLeft: number
  publisherFundStatus: boolean
  status: number
  endAt: string | null
  gameAndroidUrl: string | null
  gameIosUrl: string | null
  galleryImages: string[]
}

interface WalletTransactionResponseDto {
  id: string
  userId: string
  currency: number
  type: number
  amount: number
  reason: string
  referenceId: string | null
  createdAt: string
  holdStatus: number
  availableAt: string | null
}

interface PublisherDashboardResponseDto {
  taskCount: number
  jcoinBalance: number
  totalPaidAvailable: number
  totalPaidPending: number
  recentCompletions: WalletTransactionResponseDto[]
}

interface TaskPublisherResponseDto {
  webhookSecret: string | null
  webhookSecretMasked: string
  secretRotatedAt: string | null
}

function mapTask(dto: GameTaskResponseDto): NphTask {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    requirementType: (NPH_TASK_REQUIREMENT_TYPE_MAP[dto.requirementType] ?? 'level') as NphTaskRequirementType,
    requirementTargetValue: dto.requirementTargetValue,
    requirementHoursPerDay: dto.requirementHoursPerDay,
    requirementItemNames: dto.requirementItemNames ?? [],
    requirementSummary: dto.requirementSummary,
    rewardJcoin: dto.rewardJcoin,
    slotLimit: dto.slotLimit,
    slotUsed: dto.slotUsed,
    slotsLeft: dto.slotsLeft,
    publisherFundStatus: dto.publisherFundStatus,
    status: (NPH_TASK_STATUS_MAP[dto.status] ?? 'active') as NphTaskStatus,
    endAt: dto.endAt,
    gameAndroidUrl: dto.gameAndroidUrl,
    gameIosUrl: dto.gameIosUrl,
    galleryImages: dto.galleryImages ?? [],
  }
}

function mapTransaction(dto: WalletTransactionResponseDto): NphTransaction {
  return {
    id: dto.id,
    userId: dto.userId,
    amount: dto.amount,
    reason: dto.reason,
    referenceId: dto.referenceId,
    createdAt: dto.createdAt,
    holdStatus: (NPH_HOLD_STATUS_MAP[dto.holdStatus] ?? 'confirmed') as NphHoldStatus,
    availableAt: dto.availableAt,
  }
}

export class NphApiService {
  private static readonly BASE_PATH = '/api/publisher'

  static async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<object | null>> {
    return nphApiCall(buildJGameUrl(`${this.BASE_PATH}/change-password`), {
      method: 'POST',
      body: { oldPassword, newPassword },
    })
  }

  static async rotateWebhookSecret(): Promise<ApiResponse<NphWebhookSecretResult>> {
    const result = await nphApiCall<TaskPublisherResponseDto>(buildJGameUrl(`${this.BASE_PATH}/webhook-secret/rotate`), { method: 'POST' })
    if (!result.success || !result.data) return { success: false, data: null, message: result.message, errorCode: result.errorCode }
    return {
      success: true,
      data: {
        webhookSecret: result.data.webhookSecret,
        webhookSecretMasked: result.data.webhookSecretMasked,
        secretRotatedAt: result.data.secretRotatedAt,
      },
      message: result.message ?? null,
    }
  }

  static async getDashboard(): Promise<ApiResponse<NphDashboard>> {
    const result = await nphApiCall<PublisherDashboardResponseDto>(buildJGameUrl(`${this.BASE_PATH}/dashboard`))
    if (!result.success || !result.data) return { success: false, data: null, message: result.message, errorCode: result.errorCode }
    return {
      success: true,
      data: {
        taskCount: result.data.taskCount,
        jcoinBalance: result.data.jcoinBalance,
        totalPaidAvailable: result.data.totalPaidAvailable,
        totalPaidPending: result.data.totalPaidPending,
        recentCompletions: (result.data.recentCompletions ?? []).map(mapTransaction),
      },
      message: result.message ?? null,
    }
  }

  static async getTasks(): Promise<ApiResponse<NphTask[]>> {
    const result = await nphApiCall<GameTaskResponseDto[]>(buildJGameUrl(`${this.BASE_PATH}/tasks`))
    if (!result.success || !result.data) return { success: false, data: null, message: result.message, errorCode: result.errorCode }
    return { success: true, data: result.data.map(mapTask), message: result.message ?? null }
  }

  private static toRequestBody(payload: NphTaskFormPayload) {
    return {
      title: payload.title,
      publisherName: payload.title,
      requirementType: NPH_TASK_REQUIREMENT_TYPE_MAP.indexOf(payload.requirementType),
      requirementTargetValue: payload.requirementTargetValue,
      requirementHoursPerDay: payload.requirementHoursPerDay ?? null,
      requirementItemNames: payload.requirementItemNames ?? [],
      description: payload.description,
      steps: [],
      rewardJcoin: payload.rewardJcoin,
      slotLimit: payload.slotLimit,
      endAt: payload.endAt ?? null,
      gameAndroidUrl: payload.gameAndroidUrl ?? null,
      gameIosUrl: payload.gameIosUrl ?? null,
      galleryImagePaths: [],
    }
  }

  static async createTask(payload: NphTaskFormPayload): Promise<ApiResponse<NphTask>> {
    const result = await nphApiCall<GameTaskResponseDto>(buildJGameUrl(`${this.BASE_PATH}/tasks`), {
      method: 'POST',
      body: this.toRequestBody(payload),
    })
    if (!result.success || !result.data) return { success: false, data: null, message: result.message, errorCode: result.errorCode }
    return { success: true, data: mapTask(result.data), message: result.message ?? null }
  }

  static async updateTask(id: string, payload: NphTaskFormPayload): Promise<ApiResponse<NphTask>> {
    const result = await nphApiCall<GameTaskResponseDto>(buildJGameUrl(`${this.BASE_PATH}/tasks/${id}`), {
      method: 'PUT',
      body: { ...this.toRequestBody(payload), status: 0 },
    })
    if (!result.success || !result.data) return { success: false, data: null, message: result.message, errorCode: result.errorCode }
    return { success: true, data: mapTask(result.data), message: result.message ?? null }
  }

  static async toggleTaskStatus(id: string): Promise<ApiResponse<NphTask>> {
    const result = await nphApiCall<GameTaskResponseDto>(buildJGameUrl(`${this.BASE_PATH}/tasks/${id}/toggle-status`), { method: 'POST' })
    if (!result.success || !result.data) return { success: false, data: null, message: result.message, errorCode: result.errorCode }
    return { success: true, data: mapTask(result.data), message: result.message ?? null }
  }

  static async getTransactions(): Promise<ApiResponse<NphTransaction[]>> {
    const result = await nphApiCall<WalletTransactionResponseDto[]>(buildJGameUrl(`${this.BASE_PATH}/transactions`))
    if (!result.success || !result.data) return { success: false, data: null, message: result.message, errorCode: result.errorCode }
    return { success: true, data: result.data.map(mapTransaction), message: result.message ?? null }
  }

  static async getWallet(): Promise<ApiResponse<NphWallet>> {
    return nphApiCall(buildJGameUrl(`${this.BASE_PATH}/wallet`))
  }

  static async getWalletTopups(): Promise<ApiResponse<NphTopup[]>> {
    return nphApiCall(buildJGameUrl(`${this.BASE_PATH}/wallet/topups`))
  }

  static async createWalletTopup(amount: number): Promise<ApiResponse<NphTopup>> {
    return nphApiCall(buildJGameUrl(`${this.BASE_PATH}/wallet/topup`), { method: 'POST', body: { amount } })
  }

  static async confirmWalletTopup(id: string): Promise<ApiResponse<NphTopup>> {
    return nphApiCall(buildJGameUrl(`${this.BASE_PATH}/wallet/topup/${id}/confirm`), { method: 'POST' })
  }
}
