import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { BatteryFull, Compass, Home, Shirt, Signal, UserRound, Wifi } from 'lucide-react'

import { cn } from '@/lib/utils'

const tabs = [
  { path: '/', label: '首页', icon: Home },
  { path: '/closet', label: '衣橱', icon: Shirt },
  { path: '/discover', label: '发现', icon: Compass },
  { path: '/profile', label: '我的', icon: UserRound },
]

function StatusBar() {
  return (
    <div className="flex h-11 items-center justify-between px-7 text-[17px] font-semibold text-black">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal className="h-5 w-5 fill-black" />
        <Wifi className="h-5 w-5 stroke-[3]" />
        <BatteryFull className="h-6 w-6" />
      </div>
    </div>
  )
}

export function AppShell({ children, withInputPadding = false }: { children: ReactNode; withInputPadding?: boolean }) {
  return (
    <div className="min-h-dvh bg-[#eee8fb] text-[#111111]">
      <div className="mx-auto min-h-dvh w-full max-w-[393px] overflow-hidden bg-[url('/assets/xieshang/gradient_bg.svg')] bg-cover shadow-[0_0_42px_rgba(90,65,150,0.16)]">
        <StatusBar />
        <main className={cn('px-4 pb-[98px]', withInputPadding && 'pb-[156px]')}>{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto h-[78px] max-w-[393px] border-t border-[#f1edf8] bg-white/96 px-4 pb-2 pt-2 shadow-[0_-8px_24px_rgba(17,17,17,0.06)] backdrop-blur">
          <div className="grid grid-cols-4">
            {tabs.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition active:scale-95',
                    isActive ? 'text-[#8b5cf6]' : 'text-[#9ca3af]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn('grid h-8 w-8 place-items-center rounded-full', isActive && 'bg-[#efe7ff]')}>
                      <Icon className={cn('h-6 w-6 stroke-[2.2]', isActive && 'fill-[#8b5cf6]/15')} />
                    </span>
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
