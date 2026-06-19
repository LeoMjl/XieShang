import { apiClient } from '@/api/client'

export interface UploadResponse {
  status: string
  url: string
}

export interface UserProfile {
  id: number
  user_id: string
  nickname: string
  gender?: string
  avatar_url?: string
  height?: number
  weight?: number
  original_photo_url?: string
  base_avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface WardrobeItem {
  id: number
  user_id: string
  name: string
  category: string
  image_url: string
  color?: string
  tags: string[]
  source: string
  created_at?: string
  updated_at?: string
}

export interface OutfitItem {
  id: number
  wardrobe_item_id?: number
  name: string
  category: string
  image_url: string
}

export interface Outfit {
  id: number
  user_id: string
  name: string
  scene?: string
  cover_url?: string
  items: OutfitItem[]
  created_at?: string
  updated_at?: string
}

export interface TryonRecord {
  id: number
  user_id: string
  type: 'onboarding' | 'recommendation' | 'direct_tryon'
  scene?: string
  input_photo_url?: string
  product_url?: string
  styling_suggestion?: string
  generated_product_url?: string
  final_tryon_url?: string
  created_at?: string
}

export interface DiscoverPost {
  id: number
  title: string
  description: string
  image_url: string
  author_name: string
  author_avatar_url?: string
  scene: string
  channel: string
  tags: string[]
  like_count: number
  favorite_count: number
  is_liked: boolean
  is_favorited: boolean
  created_at?: string
}

export interface ProfileSummary {
  status?: string
  user: UserProfile
  stats: {
    wardrobe_count: number
    outfit_count: number
    tryon_count: number
    favorite_count: number
  }
  latest_records: TryonRecord[]
  wardrobe_preview: WardrobeItem[]
  outfits_preview: Outfit[]
}

export interface SessionPayload {
  user_id?: string
  nickname: string
  gender?: string
  avatar_url?: string
}

export interface WardrobeItemPayload {
  name: string
  category: string
  image_url: string
  color?: string
  tags?: string[]
  source?: string
}

export interface OutfitPayload {
  name: string
  scene?: string
  cover_url?: string
  item_ids?: number[]
}

export async function apiUpload(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiClient.post<UploadResponse>('/api/upload', formData)
  return res.data
}

export async function apiSession(payload: SessionPayload) {
  const res = await apiClient.post<UserProfile | { status: string; user: UserProfile }>('/api/session', payload)
  return 'user' in res.data ? res.data.user : res.data
}

export async function apiProfileSummary(userId: string) {
  const res = await apiClient.get<ProfileSummary>('/api/profile/summary', {
    params: { user_id: userId },
  })
  return res.data
}

export async function apiWardrobeItems(userId: string, params?: { category?: string; q?: string }) {
  const res = await apiClient.get<WardrobeItem[] | { status: string; items: WardrobeItem[] }>('/api/wardrobe/items', {
    params: { user_id: userId, ...params },
  })
  return Array.isArray(res.data) ? res.data : res.data.items
}

export async function apiCreateWardrobeItem(userId: string, payload: WardrobeItemPayload) {
  const res = await apiClient.post<WardrobeItem | { status: string; item: WardrobeItem }>('/api/wardrobe/items', payload, {
    params: { user_id: userId },
  })
  return 'item' in res.data ? res.data.item : res.data
}

export async function apiUpdateWardrobeItem(userId: string, itemId: number, payload: Partial<WardrobeItemPayload>) {
  const res = await apiClient.patch<WardrobeItem | { status: string; item: WardrobeItem }>(`/api/wardrobe/items/${itemId}`, payload, {
    params: { user_id: userId },
  })
  return 'item' in res.data ? res.data.item : res.data
}

export async function apiDeleteWardrobeItem(userId: string, itemId: number) {
  const res = await apiClient.delete<{ status: string }>(`/api/wardrobe/items/${itemId}`, {
    params: { user_id: userId },
  })
  return res.data
}

export async function apiOutfits(userId: string) {
  const res = await apiClient.get<Outfit[] | { status: string; outfits: Outfit[] }>('/api/outfits', {
    params: { user_id: userId },
  })
  return Array.isArray(res.data) ? res.data : res.data.outfits
}

export async function apiCreateOutfit(userId: string, payload: OutfitPayload) {
  const res = await apiClient.post<Outfit | { status: string; outfit: Outfit }>('/api/outfits', payload, {
    params: { user_id: userId },
  })
  return 'outfit' in res.data ? res.data.outfit : res.data
}

export async function apiUpdateOutfit(userId: string, outfitId: number, payload: Partial<OutfitPayload>) {
  const res = await apiClient.patch<Outfit | { status: string; outfit: Outfit }>(`/api/outfits/${outfitId}`, payload, {
    params: { user_id: userId },
  })
  return 'outfit' in res.data ? res.data.outfit : res.data
}

export async function apiDeleteOutfit(userId: string, outfitId: number) {
  const res = await apiClient.delete<{ status: string }>(`/api/outfits/${outfitId}`, {
    params: { user_id: userId },
  })
  return res.data
}

export async function apiTryonRecords(userId: string) {
  const res = await apiClient.get<TryonRecord[] | { status: string; records: TryonRecord[] }>('/api/tryon-records', {
    params: { user_id: userId },
  })
  return Array.isArray(res.data) ? res.data : res.data.records
}

export async function apiDiscoverPosts(userId: string, params?: { channel?: string; scene?: string; q?: string }) {
  const res = await apiClient.get<DiscoverPost[] | { status: string; posts: DiscoverPost[] }>('/api/discover/posts', {
    params: { user_id: userId, ...params },
  })
  return Array.isArray(res.data) ? res.data : res.data.posts
}

export async function apiToggleLike(postId: number, userId: string) {
  const res = await apiClient.post<DiscoverPost>(`/api/discover/posts/${postId}/like`, {
    user_id: userId,
  })
  return res.data
}

export async function apiToggleFavorite(postId: number, userId: string) {
  const res = await apiClient.post<DiscoverPost>(`/api/discover/posts/${postId}/favorite`, {
    user_id: userId,
  })
  return res.data
}
