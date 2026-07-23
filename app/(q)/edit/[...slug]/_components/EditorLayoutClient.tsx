"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LeftPanelEditor from './LeftPanelEditor';
import { useTopicStore } from '@/stores/topicStore';
import { Topics } from '@/types/api';

interface EditorLayoutClientProps {
  children: React.ReactNode;
  type: string;
  docId: string;
  initialTopics?: Topics[];
}

export default function EditorLayoutClient({ 
  children, 
  type, 
  docId, 
  initialTopics 
}: EditorLayoutClientProps) {
  const router = useRouter();
  const { setTopics, isDirty } = useTopicStore();

  useEffect(() => {
    if (initialTopics) {
      useTopicStore.setState({ topics: initialTopics, lastDocId: docId });
    }
  }, [initialTopics, docId]);

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
            <LeftPanelEditor navigate={navigate} docId={docId} type={type as 'docs' | 'posts'} />
          </aside>
        )}
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
