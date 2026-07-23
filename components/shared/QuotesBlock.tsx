import { QuotesBlockContent } from '@/types';
import React from 'react';

interface QuotesBlockProps {
  content: QuotesBlockContent;
}

export default function QuotesBlock({ content }: QuotesBlockProps) {
  return (
    <div className="relative bg-slate-50 dark:bg-zinc-900/50 p-6 md:p-8 text-slate-700 dark:text-zinc-300 italic my-10 border-l-4 border-orange-500 dark:border-orange-600 rounded-r-2xl shadow-sm">
      <p className="mb-4 text-lg leading-relaxed font-serif">"{content.data}"</p>
      {content.config.author && (
        <span className="block text-right text-slate-900 dark:text-slate-100 font-bold tracking-tight not-italic">— {content.config.author}</span>
      )}
    </div>
  );
}
