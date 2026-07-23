import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 w-full flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-slate-400" size={48} />
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading collection...</p>
    </div>
  );
}
