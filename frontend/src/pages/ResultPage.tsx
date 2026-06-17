import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Download, Copy, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store'

function canRenderUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

function LinkRow({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='flex items-center gap-3'>
      <a
        href={url}
        target='_blank'
        rel='noreferrer'
        className='inline-flex items-center gap-2 text-sm text-zinc-700 underline-offset-4 hover:underline'
      >
        <ExternalLink className='h-4 w-4' />
        打开链接
      </a>
      <button
        onClick={() => handleCopy(url)}
        className='inline-flex items-center gap-2 text-sm text-zinc-700 underline-offset-4 hover:underline'
      >
        {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
        {copied ? '已复制' : '一键复制'}
      </button>
    </div>
  )
}

export default function ResultPage() {
  const navigate = useNavigate()
  const { lastResult, setLastResult } = useAppStore()
  const [imgError, setImgError] = useState<Record<string, boolean>>({})

  const title = useMemo(() => {
    if (!lastResult) return '暂无结果'
    if (lastResult.type === 'onboarding') return '形象固化完成'
    if (lastResult.type === 'recommendation') return '推荐试穿结果'
    return '指定商品试穿结果'
  }, [lastResult])

  return (
    <div className='min-h-dvh bg-gradient-to-b from-zinc-50 to-white'>
      <div className='mx-auto max-w-md px-4 py-6 md:max-w-3xl'>
        <div className='mb-4 flex items-center justify-between'>
          <button
            className='inline-flex items-center gap-2 text-sm text-zinc-600'
            onClick={() => navigate('/')}
            type='button'
          >
            <ArrowLeft className='h-4 w-4' />
            返回需求收集
          </button>
          <div className='text-xs text-zinc-500'>结果展示</div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>{title}</CardTitle>
            <CardDescription>你可以保存图片链接或重新发起试穿</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {!lastResult ? (
              <Alert>
                <AlertTitle>还没有结果</AlertTitle>
                <AlertDescription>请从需求收集页开始一次流程</AlertDescription>
              </Alert>
            ) : null}

            {lastResult?.type === 'onboarding' ? (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-zinc-900'>你的基底形象</div>
                {canRenderUrl(lastResult.avatarUrl) && !imgError['avatar'] ? (
                  <div className='overflow-hidden rounded-md border bg-zinc-100 flex items-center justify-center p-2 min-h-[300px]'>
                    <img
                      src={lastResult.avatarUrl}
                      alt='avatar'
                      className='max-h-[500px] w-auto object-contain drop-shadow-sm'
                      onError={() => setImgError((p) => ({ ...p, avatar: true }))}
                    />
                  </div>
                ) : (
                  <div className='rounded-md border bg-zinc-50 px-3 py-2 text-xs text-zinc-700'>
                    图片无法直接预览，你可以复制链接到浏览器打开：{lastResult.avatarUrl}
                  </div>
                )}
                <LinkRow url={lastResult.avatarUrl} />
              </div>
            ) : null}

            {lastResult?.type === 'recommendation' ? (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <div className='text-sm font-medium text-zinc-900'>推荐建议</div>
                  <div className='rounded-md border bg-white px-3 py-2 text-sm leading-6 text-zinc-800'>
                    {lastResult.stylingSuggestion}
                  </div>
                </div>

                <Separator />

                <div className='space-y-2'>
                  <div className='text-sm font-medium text-zinc-900'>AI 生成商品图</div>
                  {canRenderUrl(lastResult.generatedProductUrl) && !imgError['product'] ? (
                    <div className='overflow-hidden rounded-md border bg-zinc-100 flex items-center justify-center p-2 min-h-[300px]'>
                      <img
                        src={lastResult.generatedProductUrl}
                        alt='product'
                        className='max-h-[500px] w-auto object-contain drop-shadow-sm'
                        onError={() => setImgError((p) => ({ ...p, product: true }))}
                      />
                    </div>
                  ) : (
                    <div className='rounded-md border bg-zinc-50 px-3 py-2 text-xs text-zinc-700'>
                      图片无法直接预览：{lastResult.generatedProductUrl}
                    </div>
                  )}
                  <LinkRow url={lastResult.generatedProductUrl} />
                </div>

                <Separator />

                <div className='space-y-2'>
                  <div className='text-sm font-medium text-zinc-900'>最终试穿效果</div>
                  {canRenderUrl(lastResult.finalTryonUrl) && !imgError['tryon'] ? (
                    <div className='overflow-hidden rounded-md border bg-zinc-100 flex items-center justify-center p-2 min-h-[300px]'>
                      <img
                        src={lastResult.finalTryonUrl}
                        alt='tryon'
                        className='max-h-[500px] w-auto object-contain drop-shadow-sm'
                        onError={() => setImgError((p) => ({ ...p, tryon: true }))}
                      />
                    </div>
                  ) : (
                    <div className='rounded-md border bg-zinc-50 px-3 py-2 text-xs text-zinc-700'>
                      图片无法直接预览：{lastResult.finalTryonUrl}
                    </div>
                  )}
                  <div className='flex items-center gap-3'>
                    <LinkRow url={lastResult.finalTryonUrl} />
                    <a
                      href={lastResult.finalTryonUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex items-center gap-2 text-sm text-zinc-700 underline-offset-4 hover:underline'
                    >
                      <Download className='h-4 w-4' />
                      保存
                    </a>
                  </div>
                </div>
              </div>
            ) : null}

            {lastResult?.type === 'directTryon' ? (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-zinc-900'>试穿效果图</div>
                {canRenderUrl(lastResult.finalTryonUrl) && !imgError['directTryon'] ? (
                  <div className='overflow-hidden rounded-md border bg-zinc-100 flex items-center justify-center p-2 min-h-[300px]'>
                    <img
                      src={lastResult.finalTryonUrl}
                      alt='direct tryon'
                      className='max-h-[500px] w-auto object-contain drop-shadow-sm'
                      onError={() => setImgError((p) => ({ ...p, directTryon: true }))}
                    />
                  </div>
                ) : (
                  <div className='rounded-md border bg-zinc-50 px-3 py-2 text-xs text-zinc-700'>
                    图片无法直接预览：{lastResult.finalTryonUrl}
                  </div>
                )}
                <LinkRow url={lastResult.finalTryonUrl} />
              </div>
            ) : null}

            <Separator />

            <div className='flex gap-3'>
              <Button
                variant='secondary'
                className='w-full'
                onClick={() => {
                  setLastResult(null)
                  navigate('/')
                }}
              >
                重新开始
              </Button>
              <Button className='w-full bg-black text-white hover:bg-neutral-800' onClick={() => navigate('/')}>继续试穿</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

