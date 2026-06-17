import { apiClient } from '@/api/client'

export interface UploadResponse {
  status: string
  url: string
}

export async function apiUpload(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiClient.post<UploadResponse>('/api/upload', formData)
  return res.data
}
