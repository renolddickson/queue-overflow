import Link from "next/link";
import Brand from "@/app/_components/Brand";
import { Lock, Compass } from "lucide-react";
import FloatingCharacter from "./_components/FloatingCharacter";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left Side: Content & Branding (Always Dark Background for contrast in layout, but ignoring theme) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative bg-[#020617] p-16 flex-col justify-between text-white border-r border-slate-800">
        {/* Background Accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_50%_50%,#1e40af,transparent_70%)] blur-[120px] opacity-40" />
          <div className="absolute bottom-[20%] right-[-20%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_50%_50%,#f97316,transparent_70%)] opacity-10 blur-[100px]" />
        </div>

        {/* Floating 3D Character */}
        <div className="relative z-10 flex-1">
          <FloatingCharacter />
        </div>

        {/* Branding/Footer */}
        <div className="relative z-20 flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </div>

      {/* Right Side: Authentication Form */}
      <div className="flex-1 h-screen overflow-y-auto scrollbar-hide bg-white px-6 md:px-20">
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
