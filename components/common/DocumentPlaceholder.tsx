import React from 'react';
import { Image as ImageIcon, CameraOff } from 'lucide-react';

interface DocumentPlaceholderProps {
  type?: 'blog' | 'doc' | string;
  className?: string;
  title?: string;
}

const DocumentPlaceholder: React.FC<DocumentPlaceholderProps> = ({ className = "" }) => {
  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900/50 ${className}`}>
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-500">
          <ImageIcon size={32} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
            No Preview Image
          </span>
        </div>
      </div>

      {/* Subtle corner accent */}
      <div className="absolute bottom-4 right-4 text-slate-200 dark:text-slate-800">
        <CameraOff size={14} />
      </div>
    </div>
  );
};

export default DocumentPlaceholder;
