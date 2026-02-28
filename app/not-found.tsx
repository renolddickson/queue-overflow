import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white">
            404
          </h1>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
            Page Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            The documentation you&apos;re looking for has been moved, renamed, or perhaps never existed in the first place.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/">
            <Button className="rounded-full h-14 px-10 text-md font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              Return to Base
            </Button>
          </Link>
        </div>

        <div className="pt-8 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <span>&copy; {new Date().getFullYear()} Novioc</span>
          <span>&bull;</span>
          <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
          <Link href="/status" className="hover:text-primary transition-colors">Status</Link>
        </div>
      </div>
    </div>
  )
}
