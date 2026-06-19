import { useEffect, useMemo, useState } from 'react'
import { Bell, Grid2X2, Heart, MoreHorizontal, Search, Shirt, Sparkles } from 'lucide-react'

import { apiDiscoverPosts, apiToggleLike, type DiscoverPost } from '@/api/xieshang'
import { AppShell } from '@/components/AppShell'
import { useAppStore } from '@/store'

const A = '/assets/xieshang'

const channels = ['推荐', '潮流趋势', '品牌', '搭配技巧']
const sceneTabs = [
  { label: '热门推荐', icon: Sparkles, bg: '#efe7ff', color: '#8b5cf6' },
  { label: '约会穿搭', icon: Heart, bg: '#fff0f5', color: '#e66a92' },
  { label: '职场穿搭', icon: Shirt, bg: '#edf5ff', color: '#5b8fe6' },
  { label: '旅行穿搭', image: `${A}/scene_travel.svg`, bg: '#edf9ef', color: '#58a66f' },
  { label: '日常休闲', image: `${A}/scene_daily.svg`, bg: '#fff3ed', color: '#d87955' },
  { label: '婚礼穿搭', image: `${A}/scene_wedding.svg`, bg: '#fff0ec', color: '#d87955' },
  { label: '更多', icon: Grid2X2, bg: '#f4f4f5', color: '#6b7280' },
]

const demoPosts = [
  ['紫色开衫真的太温柔了！春天必备单品💜', '泡泡', 632, `${A}/discover_model_01.png`, `${A}/model_avatar_01.svg`],
  ['职场通勤穿搭分享｜气质干练又不失温柔', 'Olivia', 521, `${A}/discover_model_02.png`, `${A}/model_avatar_03.svg`],
  ['海边度假穿搭🏝️碎花裙太出片啦~', '小夏天', 804, `${A}/discover_model_03.png`, `${A}/model_avatar_04.svg`],
  ['通勤气质穿搭｜简约高级感轻松hold住全场', '职场穿搭小助手', 731, `${A}/discover_model_04.png`, `${A}/model_avatar_05.svg`],
  ['春季穿搭｜简约休闲风舒服又好看', '穿搭研究所', 618, `${A}/discover_model_05.png`, `${A}/model_avatar_02.svg`],
  ['奶油色系穿搭分享 温柔又显气质', '小鹿酱', 682, `${A}/discover_model_06.png`, `${A}/model_avatar_01.svg`],
  ['早春通勤穿搭｜气质又减龄显瘦又百搭', '时尚日记', 547, `${A}/discover_model_07.png`, `${A}/model_avatar_05.svg`],
  ['休闲出街穿搭｜舒适自在显高显瘦又洋气', '穿搭小灵感', 498, `${A}/discover_model_08.png`, `${A}/model_avatar_03.svg`],
  ['温柔风穿搭｜春日氛围感拿捏了~', '甜甜的穿搭本', 693, `${A}/discover_model_09.png`, `${A}/model_avatar_04.svg`],
].map(([title, author, likes, image, avatar], index) => ({
  id: index + 1,
  title: String(title),
  description: String(title),
  image_url: String(image),
  author_name: String(author),
  author_avatar_url: String(avatar),
  scene: '推荐',
  channel: '推荐',
  tags: ['灵感'],
  like_count: Number(likes),
  favorite_count: 0,
  is_liked: false,
  is_favorited: false,
})) as DiscoverPost[]

function imageFor(post: DiscoverPost, index: number) {
  if (post.image_url?.startsWith('/assets/')) return post.image_url
  return demoPosts[index % demoPosts.length].image_url
}

export default function DiscoverPage() {
  const { userId, setError } = useAppStore()
  const [posts, setPosts] = useState<DiscoverPost[]>([])
  const [channel, setChannel] = useState('推荐')
  const [subTab, setSubTab] = useState('最新')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    apiDiscoverPosts(userId, { channel: channel === '推荐' ? undefined : channel, q: query.trim() || undefined })
      .then((data) => {
        if (!cancelled) setPosts(data.length ? data : demoPosts)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : '发现内容加载失败'
          setError(message)
          setPosts(demoPosts)
        }
      })
    return () => {
      cancelled = true
    }
  }, [channel, query, setError, userId])

  const visiblePosts = useMemo(() => (posts.length ? posts : demoPosts).slice(0, 9), [posts])

  const like = async (post: DiscoverPost) => {
    if (post.id <= demoPosts.length && post.image_url.startsWith('/assets/')) {
      setPosts((prev) => prev.map((item) => (item.id === post.id ? { ...item, is_liked: !item.is_liked, like_count: item.like_count + (item.is_liked ? -1 : 1) } : item)))
      return
    }
    const next = await apiToggleLike(post.id, userId)
    setPosts((prev) => prev.map((item) => (item.id === next.id ? next : item)))
  }

  return (
    <AppShell>
      <section className="pt-4">
        <header className="mb-1.5 flex h-[66px] items-start justify-between">
          <div>
            <div className="flex items-center gap-1 text-[28px] font-black leading-9">
              发现 <span className="text-[#8b5cf6]">✦</span>
            </div>
            <div className="mt-1 text-xs leading-4 tracking-[0.03em] text-[#6b7280]">发现灵感，解锁更多穿搭可能</div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="flex h-8 w-[132px] items-center gap-1.5 rounded-full bg-white px-2.5 shadow-sm">
              <Search className="h-4 w-4 text-[#6b7280]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 text-xs outline-none" placeholder="搜索穿搭、品牌" />
            </div>
            <button className="relative grid h-7 w-7 place-items-center rounded-full bg-white" type="button">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[#ff6565]" />
            </button>
          </div>
        </header>

        <div className="mb-2 flex items-center gap-7 text-left">
          {channels.map((item) => (
            <button key={item} className={`h-9 text-sm font-semibold ${channel === item ? 'text-[#8b5cf6]' : 'text-[#62656f]'}`} type="button" onClick={() => setChannel(item)}>
              {item}
              {channel === item ? <span className="mt-1 block h-0.5 w-6 rounded-full bg-[#8b5cf6]" /> : null}
            </button>
          ))}
        </div>

        <div className="mb-4 grid h-[82px] grid-cols-7 rounded-[20px] bg-white p-2 shadow-[0_4px_12px_rgba(124,58,237,0.08)]">
          {sceneTabs.map((scene) => {
            const Icon = scene.icon
            return (
              <button key={scene.label} className="text-center active:scale-95" type="button">
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-full" style={{ backgroundColor: scene.bg, color: scene.color }}>
                  {scene.image ? <img src={scene.image} alt="" className="h-8 w-8 rounded-full object-cover" /> : Icon ? <Icon className="h-6 w-6 fill-current/10" /> : null}
                </span>
                <span className="mt-1 block truncate text-[11px] font-bold">{scene.label}</span>
              </button>
            )
          })}
        </div>

        <div className="rounded-t-[20px] bg-white p-3 shadow-[0_4px_12px_rgba(124,58,237,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold leading-5">大家都在穿</h2>
            <div className="flex items-center gap-3">
              {['最新', '最热', '关注'].map((item) => (
                <button key={item} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${subTab === item ? 'bg-[#f1eafe] text-[#8b5cf6]' : 'text-[#777]'}`} type="button" onClick={() => setSubTab(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-3 gap-y-6">
            {visiblePosts.map((post, index) => (
              <article key={`${post.id}-${index}`} className="min-w-0">
                <div className="relative overflow-hidden rounded-xl bg-[#f2ece8]">
                  <img src={imageFor(post, index)} alt={post.title} className="aspect-[4/5] w-full object-cover" />
                  <button className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/92 text-[#737780]" type="button">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-black leading-5">{post.title}</h3>
                <div className="mt-2 flex items-center justify-between gap-1">
                  <div className="flex min-w-0 items-center gap-1">
                    <img src={post.author_avatar_url || demoPosts[index % demoPosts.length].author_avatar_url} alt="" className="h-5 w-5 rounded-full" />
                    <span className="truncate text-xs font-medium text-[#777]">{post.author_name}</span>
                  </div>
                  <button className={`flex shrink-0 items-center gap-1 text-xs ${post.is_liked ? 'text-[#ff7aa8]' : 'text-[#8a8d96]'}`} type="button" onClick={() => like(post).catch(() => setError('点赞失败'))}>
                    <Heart className="h-4 w-4" fill={post.is_liked ? 'currentColor' : 'none'} />
                    {post.like_count}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  )
}
