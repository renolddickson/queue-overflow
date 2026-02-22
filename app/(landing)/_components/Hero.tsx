import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary blur-[120px] rounded-full" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-orange-400 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full text-sm font-medium text-primary border border-slate-200 dark:border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span>Now with collaborative editing</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-4">
          The alternative <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-primary bg-[length:200%_auto] animate-shimmer">documentation platform</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
          Find out what&apos;s released in all your products. Experience high-quality documentation that feels like a native part of your ecosystem. 
          <span className="block mt-2 text-primary font-bold italic">Free more than time when the vibe is quality.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/auth/register">
            <button className="inline-flex items-center justify-center h-14 px-8 rounded-full text-lg font-semibold gap-2 bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors">
              Start Writing <ArrowRight size={20} />
            </button>
          </Link>
          <Link href="/feed">
            <button className="inline-flex items-center justify-center h-14 px-8 rounded-full text-lg font-semibold gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Explore Feed
            </button>
          </Link>
          <Link href="/docs/tutorial">
            <button className="inline-flex items-center justify-center h-14 px-8 rounded-full text-lg font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              See Live Demo
            </button>
          </Link>
        </div>
      </div>

      {/* Hero Visual */}
      {/* <div className="max-w-6xl mx-auto mt-20 relative px-4">
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 aspect-[16/10] group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white dark:via-slate-900/5 dark:to-slate-900" />
          <div className="absolute top-0 left-0 w-full h-full p-8 md:p-12 space-y-12">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="h-8 w-24 bg-primary/20 rounded-full" />
              </div>
            </div>
            
            <div className="grid grid-cols-12 gap-8 h-full">
              <div className="col-span-3 space-y-4">
                <div className="h-4 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
                <div className="h-4 w-4/5 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
                <div className="h-4 w-full bg-primary/10 rounded-lg border-l-2 border-primary pl-2" />
                <div className="h-4 w-3/4 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
                <div className="h-4 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
              </div>
              <div className="col-span-9 space-y-8">
                <div className="space-y-4">
                  <div className="h-10 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  <div className="h-4 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
                  <div className="h-4 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
                  <div className="h-4 w-2/3 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50" />
                  <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50" />
                  <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/10 backdrop-blur-[2px]">
            <div className="w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center cursor-pointer transform scale-90 group-hover:scale-100 transition-transform">
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-primary border-b-[12px] border-b-transparent ml-2" />
            </div>
          </div>
        </div>
      </div> */}
    </section>
  );
}
