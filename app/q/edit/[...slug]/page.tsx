"use client";

import ContentEditor from '@/components/editor/ContentEditor';
import LeftPanelEditor from '@/components/editor/LeftPanelEditor';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const Page = ({params}:{params:Promise<{slug:string}>}) => {
  const {slug} = React.use(params);
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);

  const navigate = (path: string) => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
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

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
  return (
    <>
      <div className="hidden md:block">
        <LeftPanelEditor navigate={navigate} docId={slug[0]}/>
      </div>
      {slug[1]?
      <ContentEditor setIsDirty={setIsDirty} subTopicId={slug[1]}/>
    :(
      <div className='flex justify-center items-center w-full'>No content for edit</div>
    )}
    </>
  );
};

export default Page;