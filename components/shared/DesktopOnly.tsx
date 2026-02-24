"use client";

import React, { useEffect, useState } from "react";
import { Monitor, Smartphone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DesktopOnlyProps {
  children: React.ReactNode;
}

export const DesktopOnly = ({ children }: DesktopOnlyProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Consider anything below 'lg' as non-desktop for editor comfort
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative flex justify-center">
             <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Monitor className="w-12 h-12 text-orange-600 dark:text-orange-400" />
             </div>
             <div className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-slate-900 rounded-full shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-800">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-6 h-0.5 bg-red-500 rotate-45 transform" />
                </div>
             </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-50">Desktop Experience Only</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              Our advanced editor requires a larger screen for the best creative experience. Please switch to a laptop or desktop to continue crafting your story.
            </p>
          </div>

          <div className="pt-6 flex flex-col gap-3">
             <Link href="/feed">
                <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-full py-6 text-lg font-semibold hover:scale-[1.02] transition-transform">
                    Return to Feed
                </Button>
             </Link>
             <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                Editing is temporarily disabled on mobile devices
             </p>
          </div>

          {/* Abstract blobs */}
          <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-10" />
          <div className="fixed -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
