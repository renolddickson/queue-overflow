import Link from "next/link";
import Brand from "@/app/_components/Brand";
import { Lock, Compass } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#020617]">
      {/* Left Side: Content & Branding (Dark) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative bg-[#020617] p-16 flex-col justify-between text-white border-r border-slate-800">
        {/* Background Accents */}
        <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_50%_50%,#1e40af,transparent_70%)] blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-20%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_50%_50%,#f97316,transparent_70%)] opacity-20 blur-[100px]" />
        </div>

        {/* <div className="relative z-10">
          <Brand />
        </div>

        <div className="relative z-10 max-w-lg space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl xl:text-7xl font-black leading-[1.05] tracking-tight">
              Documentation <br />
              <span className="text-slate-600">Re-imagined.</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed font-medium">
              Join thousands of engineering teams who use Novioc to build, share,
              and scale their technical knowledge.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                <Lock size={20} />
              </div>
              <h4 className="font-bold text-sm">Enterprise Security</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Your data is encrypted and isolated with bank-grade security
                protocols.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400">
                <Compass size={20} />
              </div>
              <h4 className="font-bold text-sm">Collaborative Tools</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Real-time collaboration across your entire organization.
              </p>
            </div>
          </div>
        </div> */}

        {/* <div className="relative z-10 flex items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <span>&copy; {new Date().getFullYear()} Novioc</span>
          <span>&bull;</span>
          <Link href="#" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Terms
          </Link>
        </div> */}
      </div>

      {/* Right Side: Authentication Form */}
      <div className="flex-1 h-screen overflow-y-auto scrollbar-hide bg-white dark:bg-[#020617] px-6 md:px-20">
        <div className="min-h-full w-full max-w-sm mx-auto flex flex-col justify-center py-12 space-y-10">
          <div className="lg:hidden flex justify-center">
            <Brand />
          </div>
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
