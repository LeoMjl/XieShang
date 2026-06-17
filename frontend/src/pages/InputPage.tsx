import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ImageUp, Sparkles, Shirt, Copy, Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store'

type IntentMode = 'recommendation' | 'directTryon'

function canRenderUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

export default function InputPage() {
  const navigate = useNavigate()
  const {
    userId,
    setUserId,
    height,
    setHeight,
    weight,
    setWeight,
    baseAvatarUrl,
    setPendingTask,
    setError,
    error,
    history,
    clearHistory,
  } = useAppStore()

  const [onboardingFile, setOnboardingFile] = useState<File | null>(null)
  const [mode, setMode] = useState<IntentMode>('recommendation')
  const [query, setQuery] = useState('')
  const [productFile, setProductFile] = useState<File | null>(null)
  const [copied, setCopied] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const location = useLocation()

  // 穿搭生成后，如果从 /result 跳转回来并且带有 preview 图片参数，弹出 lightbox
  useEffect(() => {
    if (location.state && location.state.previewImage) {
      setLightboxImage(location.state.previewImage)
      // 清除 state，防止刷新再次弹出
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const historyPreview = useMemo(() => history.slice(0, 3), [history])

  return (
    <div className='min-h-dvh bg-gradient-to-b from-zinc-50 to-white'>
      <div className='mx-auto max-w-md px-4 py-6 md:max-w-5xl md:px-6'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <div className='text-xs font-medium text-zinc-500'>偕裳 MVP</div>
              <h1 className='text-lg font-semibold tracking-tight text-zinc-900'>需求收集</h1>
            </div>
            <div className='hidden md:block text-xs text-zinc-500'>移动端优先 · 三步跑通闭环</div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>模拟用户</CardTitle>
              <CardDescription>同一个用户 ID 会复用你的固化形象</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Label htmlFor='userId'>用户 ID</Label>
              <Input
                  id='userId'
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder='例如：test_user_001'
                  className='placeholder:text-gray-400'
                />
            </CardContent>
          </Card>

          {error ? (
            <Alert className='border-red-200 bg-red-50'>
              <AlertTitle className='text-red-700'>发生错误</AlertTitle>
              <AlertDescription className='text-red-700'>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>1) 形象固化</CardTitle>
                <CardDescription>上传照片 + 身高体重，生成你的基底全身形象</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='height'>身高 (cm)</Label>
                    <Input
                      id='height'
                      inputMode='numeric'
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder='175'
                      className='placeholder:text-gray-400'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='weight'>体重 (kg)</Label>
                    <Input
                      id='weight'
                      inputMode='numeric'
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder='65'
                      className='placeholder:text-gray-400'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='onboardingFile'>照片</Label>
                  <Input
                    id='onboardingFile'
                    type='file'
                    accept='image/*'
                    className='text-zinc-400 file:text-zinc-900 dark:file:text-zinc-100'
                    onChange={(e) => setOnboardingFile(e.target.files?.[0] || null)}
                  />
                  <div className='text-xs text-zinc-500'>建议用清晰的半身/全身照</div>
                </div>

                <Button
                  className='w-full bg-black text-white hover:bg-neutral-800'
                  onClick={() => {
                    setError(null)
                    if (!height || !weight || !onboardingFile) {
                      setError('请填写身高、体重并上传照片')
                      return
                    }
                    setPendingTask({
                      type: 'onboarding',
                      payload: {
                        height,
                        weight,
                        file: onboardingFile,
                      },
                    })
                    navigate('/loading')
                  }}
                >
                  <ImageUp className='mr-2 h-4 w-4' />
                  生成基底形象
                </Button>

                {baseAvatarUrl ? (
                  <div className='space-y-2'>
                    <Separator />
                    <div className='text-sm font-medium text-zinc-900'>当前固化形象</div>
                    {canRenderUrl(baseAvatarUrl) ? (
                      <div className='overflow-hidden rounded-md border bg-white flex flex-col'>
                        <div className='flex-1 min-h-[300px] bg-zinc-100 flex items-center justify-center p-2'>
                          <img
                            src={baseAvatarUrl}
                            alt='base avatar'
                            className='max-h-[400px] w-auto object-contain drop-shadow-sm cursor-pointer hover:scale-105 transition-transform duration-300'
                            onClick={() => setLightboxImage(baseAvatarUrl)}
                            onError={(e) => {
                              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>
                        <div className='border-t px-3 py-2 bg-zinc-50 flex items-center justify-between'>
                          <div className='text-xs text-zinc-500 truncate mr-2'>
                            图片链接已生成
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs px-2 shrink-0"
                            onClick={() => handleCopy(baseAvatarUrl)}
                          >
                            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                            {copied ? '已复制' : '一键复制'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className='rounded-md border bg-zinc-50 px-3 py-2 text-xs text-zinc-700'>
                        {baseAvatarUrl}
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>2) 意图输入</CardTitle>
                <CardDescription>选择一种方式触发“推荐试穿”或“指定商品试穿”</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-2 rounded-md bg-zinc-50 p-1'>
                  <button
                    className={
                      mode === 'recommendation'
                        ? 'rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm'
                        : 'rounded-md px-3 py-2 text-sm text-zinc-600'
                    }
                    onClick={() => setMode('recommendation')}
                    type='button'
                  >
                    智能推荐
                  </button>
                  <button
                    className={
                      mode === 'directTryon'
                        ? 'rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm'
                        : 'rounded-md px-3 py-2 text-sm text-zinc-600'
                    }
                    onClick={() => setMode('directTryon')}
                    type='button'
                  >
                    指定商品
                  </button>
                </div>

                {mode === 'recommendation' ? (
                  <div className='space-y-2'>
                    <Label htmlFor='query'>场景需求</Label>
                    <Textarea
                      id='query'
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder='例如：明天去三亚旅游，推荐一套适合在海边拍照的裙子'
                      className='placeholder:text-gray-400'
                    />
                    <Button
                      className='w-full bg-black text-white hover:bg-neutral-800'
                      onClick={() => {
                        setError(null)
                        if (!baseAvatarUrl) {
                          setError('请先完成左侧的“形象固化”')
                          return
                        }
                        if (!query.trim()) {
                          setError('请输入场景需求')
                          return
                        }
                        setPendingTask({
                          type: 'recommendation',
                          payload: {
                            query: query.trim(),
                          },
                        })
                        navigate('/loading')
                      }}
                    >
                      <Sparkles className='mr-2 h-4 w-4' />
                      获取推荐并试穿
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    <Label htmlFor='productFile'>上传商品图</Label>
                    <Input
                      id='productFile'
                      type='file'
                      accept='image/*'
                      className='text-zinc-400 file:text-zinc-900 dark:file:text-zinc-100'
                      onChange={(e) => setProductFile(e.target.files?.[0] || null)}
                    />
                    <Button
                      className='w-full bg-black text-white hover:bg-neutral-800'
                      onClick={() => {
                        setError(null)
                        if (!baseAvatarUrl) {
                          setError('请先完成左侧的“形象固化”')
                          return
                        }
                        if (!productFile) {
                          setError('请上传商品图片')
                          return
                        }
                        setPendingTask({
                          type: 'directTryon',
                          payload: {
                            file: productFile,
                          },
                        })
                        navigate('/loading')
                      }}
                    >
                      <Shirt className='mr-2 h-4 w-4' />
                      一键试穿
                    </Button>
                  </div>
                )}

                <Separator />

                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium text-zinc-900'>最近试穿</div>
                  <button
                    className='text-xs text-zinc-500 underline-offset-4 hover:underline'
                    onClick={() => clearHistory()}
                    type='button'
                  >
                    清空
                  </button>
                </div>

                {historyPreview.length ? (
                  <div className='space-y-2'>
                    {historyPreview.map((item) => (
                      <div
                        key={item.id}
                        className='rounded-md border bg-white px-3 py-2'
                      >
                        <div className='flex items-center justify-between gap-2'>
                          <div className='text-xs font-medium text-zinc-900'>
                            {item.type === 'recommendation' ? '智能推荐' : '指定商品'}
                          </div>
                          <div className='text-[11px] text-zinc-500'>
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className='mt-2 flex gap-2'>
                          {canRenderUrl(item.finalTryonUrl) ? (
                            <img 
                              src={item.finalTryonUrl} 
                              alt="tryon preview" 
                              className="h-16 w-16 rounded object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setLightboxImage(item.finalTryonUrl)}
                            />
                          ) : null}
                          <div className='truncate text-xs text-zinc-600 flex-1 self-center'>
                            {item.finalTryonUrl}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-xs text-zinc-500'>暂无记录</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className='text-center text-xs text-zinc-500'>
            后端接口默认读取 {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}
          </div>
        </div>
      </div>

      {/* Lightbox 弹出层 */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -top-4 -right-4 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 z-50 backdrop-blur-md"
              onClick={() => setLightboxImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <img 
              src={lightboxImage} 
              alt="fullscreen preview" 
              className="w-auto max-w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
            />
            <div className="mt-4 flex gap-4">
              <Button 
                variant="secondary" 
                onClick={() => handleCopy(lightboxImage)}
                className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? '已复制链接' : '复制图片链接'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => window.open(lightboxImage, '_blank')}
                className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
              >
                新窗口打开
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

