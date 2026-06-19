import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Copy, Download, Home, RotateCcw, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store'

function canPreview(url?: string) {
  return Boolean(url && (/^https?:\/\//i.test(url) || url.startsWith('/')))
}

function CopyButton({ value }: { value?: string }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null

  return (
    <button
      className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm"
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      }}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      {copied ? '已复制' : '复制链接'}
    </button>
  )
}

function ImagePanel({ title, url }: { title: string; url?: string }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="text-sm font-semibold text-slate-950">{title}</div>
        <CopyButton value={url} />
      </div>
      {canPreview(url) ? (
        <img src={url} alt={title} className="max-h-[520px] w-full bg-slate-50 object-contain" />
      ) : (
        <div className="px-3 pb-3">
          <div className="rounded-lg bg-slate-50 px-3 py-10 text-center text-xs text-slate-500">{url || '暂无图片'}</div>
        </div>
      )}
    </div>
  )
}

export default function ResultPage() {
  const navigate = useNavigate()
  const { lastResult, setLastResult } = useAppStore()

  const title = !lastResult
    ? '暂无结果'
    : lastResult.type === 'onboarding'
      ? '形象固化完成'
      : lastResult.type === 'recommendation'
        ? '推荐试穿完成'
        : '指定商品试穿完成'

  return (
    <div className="min-h-dvh bg-[#f4f0ff] text-slate-900">
      <main className="mx-auto min-h-dvh w-full max-w-[480px] bg-[linear-gradient(180deg,#efe8ff_0%,#ffffff_42%)] px-4 pb-8 pt-5">
        <header className="mb-4 flex items-center justify-between">
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-700 shadow-sm" onClick={() => navigate('/')} type="button">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[#6d57d9] shadow-sm">结果页</div>
        </header>

        <section className="mb-4 rounded-lg bg-[#6d57d9] p-4 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/16">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="mt-1 text-xs text-white/75">结果已保存到历史记录，可继续生成新的场景。</p>
            </div>
          </div>
        </section>

        {!lastResult ? (
          <div className="rounded-lg bg-white px-3 py-12 text-center text-sm text-slate-500 shadow-sm">还没有生成结果，请先从首页开始一次 AI 试穿。</div>
        ) : null}

        <div className="space-y-4">
          {lastResult?.type === 'onboarding' ? <ImagePanel title="你的专属形象" url={lastResult.avatarUrl} /> : null}

          {lastResult?.type === 'recommendation' ? (
            <>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-2 text-sm font-semibold text-slate-950">穿搭建议</div>
                <p className="text-sm leading-6 text-slate-600">{lastResult.stylingSuggestion}</p>
                {lastResult.scene ? <div className="mt-3 rounded-full bg-[#f0e9ff] px-3 py-2 text-xs text-[#6d57d9]">{lastResult.scene}</div> : null}
              </div>
              <ImagePanel title="AI 商品图" url={lastResult.generatedProductUrl} />
              <ImagePanel title="最终试穿效果" url={lastResult.finalTryonUrl} />
            </>
          ) : null}

          {lastResult?.type === 'directTryon' ? (
            <>
              {lastResult.productUrl ? <ImagePanel title="试穿商品" url={lastResult.productUrl} /> : null}
              <ImagePanel title="最终试穿效果" url={lastResult.finalTryonUrl} />
            </>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Button className="rounded-full bg-white text-slate-700 hover:bg-slate-50" onClick={() => navigate('/')}>
            <Home className="h-4 w-4" />
            首页
          </Button>
          <Button
            className="rounded-full bg-white text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setLastResult(null)
              navigate('/')
            }}
          >
            <RotateCcw className="h-4 w-4" />
            再试
          </Button>
          <Button
            className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
            onClick={() => {
              const url =
                lastResult?.type === 'onboarding'
                  ? lastResult.avatarUrl
                  : lastResult?.type === 'recommendation'
                    ? lastResult.finalTryonUrl
                    : lastResult?.finalTryonUrl
              if (url) window.open(url, '_blank')
            }}
          >
            <Download className="h-4 w-4" />
            打开
          </Button>
        </div>
      </main>
    </div>
  )
}
