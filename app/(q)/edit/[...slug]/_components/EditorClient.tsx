"use client";

import ContentEditor from '@/app/(q)/edit/[...slug]/_components/ContentEditor';
import { useTopicStore } from '@/stores/topicStore';

export const EditorClient = ({ 
  slug, 
  initialDoc, 
}: { 
  slug: string[]; 
  initialDoc: any; 
}) => {
  const [type, docId, subId] = slug;
  const { isDirty, setIsDirty } = useTopicStore();

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full">
      {(type === 'docs' && subId) || (type === 'posts' && docId) ? (
        <ContentEditor 
            setIsDirty={setIsDirty} 
            subTopicId={type === 'docs' ? subId : docId} 
            type={type as 'docs' | 'posts'} 
            docData={initialDoc}
        />
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-500 bg-white dark:bg-background">
            <p className="text-lg font-medium italic">Select a page to start editing</p>
        </div>
      )}
    </div>
  );
};
