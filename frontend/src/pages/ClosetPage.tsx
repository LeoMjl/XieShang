import { useEffect, useMemo, useState } from 'react'
import { Bot, CalendarDays, ChevronRight, Filter, MoreHorizontal, Plus, Search, Send, Settings } from 'lucide-react'

import { apiCreateOutfit, apiOutfits, apiWardrobeItems, type Outfit, type WardrobeItem } from '@/api/xieshang'
import { AppShell } from '@/components/AppShell'
import { useAppStore } from '@/store'

const A = '/assets/xieshang'

const categoryTabs = [
  { label: '全部', icon: '●●' },
  { label: '上衣', image: `${A}/clothes_top_01.svg` },
  { label: '下装', image: `${A}/clothes_bottom_01.svg` },
  { label: '连衣裙', image: `${A}/clothes_dress_01.svg` },
  { label: '外套', image: `${A}/clothes_outer_01.svg` },
  { label: '鞋子', image: `${A}/clothes_shoes_01.svg` },
  { label: '配饰', image: `${A}/clothes_hat_01.svg` },
  { label: '包包', image: `${A}/clothes_bag_01.svg` },
]

const imageMap: Record<string, string> = {
  上衣: `${A}/wardrobe_knit_purple.png`,
  下装: `${A}/wardrobe_jeans_straight.png`,
  外套: `${A}/wardrobe_blazer_beige.png`,
  连衣裙: `${A}/wardrobe_dress_french.png`,
  鞋子: `${A}/wardrobe_shoes_white.png`,
  包包: `${A}/wardrobe_bag_beige.png`,
  配饰: `${A}/wardrobe_hat_beret.png`,
}

const imageByName: Record<string, string> = {
  紫色针织衫: `${A}/wardrobe_knit_purple.png`,
  白色衬衫: `${A}/wardrobe_shirt_white.png`,
  米色西装外套: `${A}/wardrobe_blazer_beige.png`,
  直筒牛仔裤: `${A}/wardrobe_jeans_straight.png`,
  法式连衣裙: `${A}/wardrobe_dress_french.png`,
  小白鞋: `${A}/wardrobe_shoes_white.png`,
  米色单肩包: `${A}/wardrobe_bag_beige.png`,
  贝雷帽: `${A}/wardrobe_hat_beret.png`,
}

const demoItems = [
  { id: 1, name: '紫色针织衫', category: '上衣', image_url: `${A}/wardrobe_knit_purple.png`, created_at: '2024-05-20' },
  { id: 2, name: '白色衬衫', category: '上衣', image_url: `${A}/wardrobe_shirt_white.png`, created_at: '2024-05-18' },
  { id: 3, name: '米色西装外套', category: '外套', image_url: `${A}/wardrobe_blazer_beige.png`, created_at: '2024-05-15' },
  { id: 4, name: '直筒牛仔裤', category: '下装', image_url: `${A}/wardrobe_jeans_straight.png`, created_at: '2024-05-12' },
  { id: 5, name: '法式连衣裙', category: '连衣裙', image_url: `${A}/wardrobe_dress_french.png`, created_at: '2024-05-10' },
  { id: 6, name: '小白鞋', category: '鞋子', image_url: `${A}/wardrobe_shoes_white.png`, created_at: '2024-05-08' },
  { id: 7, name: '米色单肩包', category: '包包', image_url: `${A}/wardrobe_bag_beige.png`, created_at: '2024-05-05' },
  { id: 8, name: '贝雷帽', category: '配饰', image_url: `${A}/wardrobe_hat_beret.png`, created_at: '2024-05-03' },
] as WardrobeItem[]

function imageFor(item: WardrobeItem) {
  if (imageByName[item.name]) return imageByName[item.name]
  if (item.image_url?.startsWith('/assets/')) return item.image_url
  return imageMap[item.category] || item.image_url || `${A}/wardrobe_knit_purple.png`
}

export default function ClosetPage() {
  const { userId, setError } = useAppStore()
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [category, setCategory] = useState('全部')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [chat, setChat] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([apiWardrobeItems(userId), apiOutfits(userId)])
      .then(([nextItems, nextOutfits]) => {
        if (cancelled) return
        setItems(nextItems.length ? nextItems : demoItems)
        setOutfits(nextOutfits)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : '衣橱加载失败'
        setError(message)
        setItems(demoItems)
      })
    return () => {
      cancelled = true
    }
  }, [setError, userId])

  const visibleItems = useMemo(() => {
    return (items.length ? items : demoItems)
      .filter((item) => category === '全部' || item.category === category)
      .slice(0, 8)
  }, [category, items])

  const stats = useMemo(() => {
    const source = items.length ? items : demoItems
    return {
      total: source.length || 128,
      tops: source.filter((item) => item.category === '上衣').length || 56,
      bottoms: source.filter((item) => item.category === '下装').length || 38,
      accessories: source.filter((item) => ['配饰', '包包', '鞋子'].includes(item.category)).length || 34,
    }
  }, [items])

  const createOutfit = async () => {
    if (!selectedIds.length) {
      setError('请先选择至少一件单品')
      return
    }
    const outfit = await apiCreateOutfit(userId, {
      name: `新建穿搭 ${outfits.length + 1}`,
      scene: '灵感搭配',
      cover_url: `${A}/tryon_effect_02.png`,
      item_ids: selectedIds,
    })
    setOutfits((prev) => [outfit, ...prev])
    setSelectedIds([])
  }

  return (
    <AppShell withInputPadding>
      <section className="pt-4">
        <header className="mb-4 flex h-[74px] items-start justify-between">
          <div>
            <div className="flex items-center gap-1 text-[28px] font-black">
              我的衣橱 <span className="text-[#8b5cf6]">✦</span>
            </div>
            <div className="mt-2 text-[15px] text-[#6b7280]">管理我的服装，轻松搭配每一天</div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button className="flex h-9 items-center gap-1 rounded-full bg-white px-3 text-sm font-bold text-[#8b5cf6] shadow-[0_4px_12px_rgba(124,58,237,0.08)]" type="button">
              <CalendarDays className="h-4 w-4" />
              穿搭日历
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-white" type="button">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="rounded-[18px] border border-[#eadffd] bg-[#f0e7ff] px-3 py-2.5 shadow-[0_4px_12px_rgba(124,58,237,0.08)]">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[16px] font-bold leading-5">衣橱总览</h2>
            <button className="flex h-7 items-center rounded-full bg-white/70 px-2.5 text-xs font-semibold text-[#8b5cf6]" type="button">
              查看统计 <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              ['👚', stats.total, '全部单品'],
              ['👕', stats.tops, '上衣'],
              ['👖', stats.bottoms, '下装'],
              ['👜', stats.accessories, '配饰/鞋包'],
            ].map(([icon, count, label]) => (
              <div className="flex h-[52px] items-center justify-center gap-1.5 rounded-lg bg-white px-1.5" key={label}>
                <div className="text-[18px] leading-none">{icon}</div>
                <div className="min-w-0">
                  <div className="text-[17px] font-black leading-5">{count}</div>
                  <div className="truncate text-[10px] leading-3 text-[#7b7f89]">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid h-16 grid-cols-8 rounded-[20px] bg-white p-1 shadow-[0_4px_12px_rgba(124,58,237,0.08)]">
          {categoryTabs.map((tab) => {
            const active = category === tab.label
            return (
              <button key={tab.label} className={`rounded-2xl text-center text-xs font-semibold active:scale-95 ${active ? 'bg-[#f1eafe] text-[#8b5cf6]' : 'text-[#8a8d96]'}`} type="button" onClick={() => setCategory(tab.label)}>
                {tab.image ? <img src={tab.image} alt="" className="mx-auto h-6 w-6 object-contain" /> : <span className="mx-auto block text-lg leading-6">••</span>}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 rounded-[20px] bg-white p-3 shadow-[0_4px_12px_rgba(124,58,237,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold leading-5">我的单品 <span className="text-[13px] font-medium text-[#8a8d96]">({visibleItems.length || 128})</span></h2>
            <div className="flex gap-2">
              <button className="flex h-8 items-center gap-1 rounded-full bg-[#f6f5f8] px-2.5 text-xs font-semibold" type="button"><Search className="h-3.5 w-3.5" />搜索</button>
              <button className="flex h-8 items-center gap-1 rounded-full bg-[#f6f5f8] px-2.5 text-xs font-semibold" type="button"><Filter className="h-3.5 w-3.5" />筛选</button>
              <button className="h-8 rounded-full bg-[#f6f5f8] px-2.5 text-xs font-semibold" type="button">最新⌄</button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-x-3 gap-y-5">
            {visibleItems.map((item) => (
              <button key={item.id} className="relative text-left active:scale-95" type="button" onClick={() => setSelectedIds((prev) => (prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]))}>
                <div className={`relative overflow-hidden rounded-xl border ${selectedIds.includes(item.id) ? 'border-[#8b5cf6]' : 'border-transparent'} bg-[#f8f6f3]`}>
                  <img src={imageFor(item)} alt={item.name} className="aspect-[4/5] w-full object-cover" />
                  <span className="absolute bottom-1 left-1 rounded-md bg-[#a879f7] px-2 py-0.5 text-[11px] font-bold text-white">{item.category}</span>
                  <span className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-[#8a8d96]"><MoreHorizontal className="h-4 w-4" /></span>
                </div>
                <div className="mt-2 truncate text-sm font-bold">{item.name}</div>
                <div className="text-xs text-[#8a8d96]">{item.created_at?.slice(0, 10) || '2024-05-20'}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[20px] bg-white p-3 shadow-[0_4px_12px_rgba(124,58,237,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold leading-5">我的穿搭 <span className="text-[13px] font-medium text-[#8a8d96]">({outfits.length || 12})</span></h2>
            <button className="flex items-center text-sm font-medium text-[#8a8d96]" type="button">查看全部 <ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[
              ['温柔约会穿搭', '3件单品', `${A}/tryon_effect_01.png`],
              ['职场通勤穿搭', '4件单品', `${A}/tryon_effect_02.png`],
              ['周末休闲穿搭', '5件单品', `${A}/tryon_effect_03.png`],
            ].map(([name, count, image]) => (
              <div className="w-[92px] shrink-0 rounded-xl bg-[#f6f3fb] p-2" key={name}>
                <img src={image} alt="" className="h-[64px] w-full rounded-lg object-cover" />
                <div className="mt-2 truncate text-xs font-bold">{name}</div>
                <div className="text-[11px] text-[#8a8d96]">{count}</div>
              </div>
            ))}
            <button className="flex h-[112px] w-[92px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#f3eafe] text-[#8b5cf6] active:scale-95" type="button" onClick={createOutfit}>
              <Plus className="h-8 w-8" />
              <span className="mt-2 text-sm font-bold">新建穿搭</span>
            </button>
          </div>
        </div>

        <div className="fixed bottom-[88px] left-1/2 z-40 flex h-14 w-[361px] -translate-x-1/2 items-center gap-3 rounded-[20px] border border-[#e4d7ff] bg-white px-3 shadow-[0_8px_24px_rgba(124,58,237,0.14)]">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#8b5cf6] text-white"><Bot className="h-6 w-6" /></div>
          <input value={chat} onChange={(e) => setChat(e.target.value)} className="min-w-0 flex-1 text-base outline-none placeholder:text-[#9ca3af]" placeholder="有什么穿搭问题都可以问我哦~" />
          <button className="grid h-10 w-10 place-items-center rounded-full bg-[#8b5cf6] text-white" type="button"><Send className="h-5 w-5" /></button>
        </div>
      </section>
    </AppShell>
  )
}
