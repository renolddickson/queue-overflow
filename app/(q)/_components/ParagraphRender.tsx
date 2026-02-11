import React from 'react';

export function ParagraphRender({ html }: { html: string }) {
  if (!html) return null;
  
  return (
    <div 
      className="text-slate-600 dark:text-slate-700 leading-relaxed mb-4 prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
