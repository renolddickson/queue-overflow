"use client";

import ContentEditor from '@/app/(q)/edit/[...slug]/_components/ContentEditor';
import LeftPanelEditor from '@/app/(q)/edit/[...slug]/_components/LeftPanelEditor';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export const EditorClient = ({ slug, initialDoc }: { slug: string[]; initialDoc: any }) => {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [type, docId, subId] = slug;

  const navigate = (path: string) => {
    if (isDirty && !window.confirm('Are you sure you want to discard changes?')) {
      return;
    }
    router.push(path);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isDirty) return;
      
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        // Only intercept if it's a real navigation away from the current editor
        const url = new URL(link.href);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          if (!window.confirm('Are you sure you want to discard changes?')) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isDirty]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-slate-50 dark:bg-black">
      <div className="flex flex-1 overflow-hidden">
        {type === 'docs' && (
          <aside className="hidden md:block w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background shrink-0">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
               <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document Structure</h2>
            </div>
            <LeftPanelEditor navigate={navigate} docId={docId} type={type} />
          </aside>
        )}
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {(type === 'docs' && subId) || (type === 'posts' && docId) ? (
            <ContentEditor 
                setIsDirty={setIsDirty} 
                subTopicId={type === 'docs' ? subId : docId} 
                type={type} 
                docData={initialDoc}
            />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500 bg-white dark:bg-background">
                <p className="text-lg font-medium italic">Select a page to start editing</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};