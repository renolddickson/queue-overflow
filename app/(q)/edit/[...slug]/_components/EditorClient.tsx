"use client";

import ContentEditor from '@/app/(q)/edit/[...slug]/_components/ContentEditor';
import LeftPanelEditor from '@/app/(q)/edit/[...slug]/_components/LeftPanelEditor';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export const EditorClient = ({ slug }: { slug: string[] }) => {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [type, docId, subId] = slug;

  const navigate = (path: string) => {
    // if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
    //   return;
    // }
    router.push(path);
  };
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
  return (
    <>
    {type == 'doc' &&
      <div className="hidden md:block">
        <LeftPanelEditor navigate={navigate} docId={docId}/>
      </div>
      }
      {(type == 'doc' && subId)|| (type=='blog' && docId)?
      <ContentEditor setIsDirty={setIsDirty} subTopicId={type== 'doc' ? subId : docId} />
    :(
      <div className='flex justify-center items-center w-full text-lg font-medium text-gray-500'>No content available</div>
    )}
    </>
  );
};