import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useAppStore } from '@/store'
import { apiUpload } from '@/api/xieshang'

function createId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export default function LoadingPage() {
  const navigate = useNavigate()
  const {
    userId,
    pendingTask,
    setPendingTask,
    setIsLoading,
    isLoading,
    loadingStage,
    setLoadingStage,
    error,
    setError,
    setBaseAvatarUrl,
    setLastResult,
    addHistory,
  } = useAppStore()

  const wsRef = useRef<WebSocket | null>(null)
  // 用于手动模拟某些步骤的完成，如果后端颗粒度不够细
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const steps = useMemo(() => {
    if (!pendingTask) return ['准备中...']
    if (pendingTask.type === 'onboarding') {
      return ['正在分析照片与体型特征', '正在生成全身基底形象']
    }
    if (pendingTask.type === 'recommendation') {
      return ['正在读取你的固化形象', '正在生成穿搭建议与商品图', '正在合成试穿效果']
    }
    return ['正在读取你的固化形象', '正在解析商品图片', '正在合成试穿效果']
  }, [pendingTask])

  const tips = useMemo(
    () => [
      '小贴士：照片越清晰，后续试穿效果越稳定。',
      '小贴士：描述场景越具体，推荐越贴合。',
      '小贴士：你可以先用测试用户 ID 快速体验流程。',
    ],
    []
  )

  useEffect(() => {
    if (!pendingTask) {
      navigate('/')
      return
    }

    let cancelled = false
    setError(null)
    setIsLoading(true)
    setLoadingStage(0)
    setCompletedSteps([])

    const run = async () => {
      try {
        let fileUrl = ''
        // Step 1: 如果有文件，先通过 HTTP 上传
        if ('file' in pendingTask.payload && pendingTask.payload.file) {
          const res = await apiUpload(pendingTask.payload.file)
          if (cancelled) return
          fileUrl = res.url
          // 上传完成，如果是直接试穿，第一步算完成
          if (pendingTask.type === 'directTryon') {
            setCompletedSteps((prev) => [...prev, 0, 1])
            setLoadingStage(2)
          } else if (pendingTask.type === 'onboarding') {
            // 上传只是开始
          }
        } else {
          // recommendation 没有文件，第一步“读取固化形象”可以直接算完成
          if (pendingTask.type === 'recommendation') {
            setCompletedSteps((prev) => [...prev, 0])
            setLoadingStage(1)
          }
        }

        // Step 2: 连接 WebSocket 获取进度和结果
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/process'
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          if (pendingTask.type === 'onboarding') {
            ws.send(JSON.stringify({
              type: 'onboarding',
              user_id: userId,
              height: pendingTask.payload.height,
              weight: pendingTask.payload.weight,
              file_url: fileUrl
            }))
          } else if (pendingTask.type === 'recommendation') {
            ws.send(JSON.stringify({
              type: 'recommendation',
              user_id: userId,
              query: pendingTask.payload.query
            }))
          } else if (pendingTask.type === 'directTryon') {
            ws.send(JSON.stringify({
              type: 'direct-tryon',
              user_id: userId,
              file_url: fileUrl
            }))
          }
        }

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          if (data.status === 'error') {
            setError(data.message)
            setIsLoading(false)
            ws.close()
          } else if (data.status === 'progress') {
            const node = data.node
            if (pendingTask.type === 'onboarding') {
              if (node === 'profiling') {
                setCompletedSteps((prev) => [...prev, 0])
                setLoadingStage(1)
              }
            } else if (pendingTask.type === 'recommendation') {
              if (node === 'styling') {
                setCompletedSteps((prev) => [...prev, 1])
                setLoadingStage(2)
              }
            } else if (pendingTask.type === 'directTryon') {
               // ...
            }
          } else if (data.status === 'success') {
            // 完成所有步骤
            setCompletedSteps((prev) => [...prev, 0, 1, 2, 3])
            
            setTimeout(() => {
              if (cancelled) return
              if (pendingTask.type === 'onboarding') {
                setBaseAvatarUrl(data.avatar_url)
                setLastResult({ type: 'onboarding', avatarUrl: data.avatar_url })
                setPendingTask(null)
                navigate('/result')
              } else if (pendingTask.type === 'recommendation') {
                setLastResult({
                  type: 'recommendation',
                  stylingSuggestion: data.styling_suggestion,
                  generatedProductUrl: data.generated_product_url,
                  finalTryonUrl: data.final_tryon_url,
                })
                addHistory({
                  id: createId(),
                  type: 'recommendation',
                  finalTryonUrl: data.final_tryon_url,
                  timestamp: Date.now(),
                })
                setPendingTask(null)
                navigate('/', { state: { previewImage: data.final_tryon_url } })
              } else if (pendingTask.type === 'directTryon') {
                setLastResult({ type: 'directTryon', finalTryonUrl: data.final_tryon_url })
                addHistory({
                  id: createId(),
                  type: 'directTryon',
                  finalTryonUrl: data.final_tryon_url,
                  timestamp: Date.now(),
                })
                setPendingTask(null)
                navigate('/', { state: { previewImage: data.final_tryon_url } })
              }
            }, 500)
          }
        }

        ws.onerror = () => {
          if (!cancelled && isLoading) {
            setError('WebSocket 连接失败，请检查后端是否正常运行。')
            setIsLoading(false)
          }
        }

        ws.onclose = () => {
          if (!cancelled) setIsLoading(false)
        }

      } catch (e: any) {
        if (cancelled) return
        const msg = e?.response?.data?.detail || e?.message || '请求失败，请确认后端已启动'
        setError(String(msg))
        setIsLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [
    addHistory,
    navigate,
    pendingTask,
    setBaseAvatarUrl,
    setError,
    setIsLoading,
    setLastResult,
    setLoadingStage,
    setPendingTask,
    userId,
  ])

  const [tipIndex, setTipIndex] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [tips.length])
  
  const currentTip = tips[tipIndex]

  return (
    <div className='min-h-dvh bg-gradient-to-b from-zinc-50 to-white'>
      <div className='mx-auto max-w-md px-4 py-6'>
        <div className='mb-4 flex items-center justify-between'>
          <button
            className='inline-flex items-center gap-2 text-sm text-zinc-600'
            onClick={() => {
              setPendingTask(null)
              navigate('/')
            }}
            type='button'
          >
            <ArrowLeft className='h-4 w-4' />
            返回
          </button>
          <div className='text-xs text-zinc-500'>沉浸式加载</div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>AI 正在处理</CardTitle>
            <CardDescription>这一步通常需要几秒到几十秒</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-2 rounded-md border bg-white px-3 py-2'>
              <Loader2 className='h-4 w-4 animate-spin text-zinc-700' />
              <div className='text-sm text-zinc-800'>
                {steps[Math.min(loadingStage, steps.length - 1)]}
              </div>
            </div>

            <div className='space-y-2'>
              {steps.map((s, idx) => {
                const isCompleted = completedSteps.includes(idx)
                const isActive = idx === loadingStage
                return (
                  <div
                    key={s}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-xs ${
                      isActive
                        ? 'bg-zinc-900 text-white'
                        : isCompleted
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    <span>{idx + 1}. {s}</span>
                    {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </div>
                )
              })}
            </div>

            <div className='rounded-md border bg-zinc-50 px-3 py-2 text-xs text-zinc-600'>
              {currentTip}
            </div>

            {error ? (
              <Alert className='border-red-200 bg-red-50'>
                <AlertTitle className='text-red-700'>处理失败</AlertTitle>
                <AlertDescription className='text-red-700'>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              variant='secondary'
              className='w-full'
              disabled={isLoading}
              onClick={() => {
                setPendingTask(null)
                navigate('/')
              }}
            >
              返回重新填写
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

