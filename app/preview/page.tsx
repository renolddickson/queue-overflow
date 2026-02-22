"use client";

import MainContent from "@/components/common/Content";
import { useState } from "react";
import PreviewHandler from "@/components/common/PreviewHandler";
import { ContentRecord } from "@/types/api";

export default function PreviewPage() {
  const [data, setData] = useState<ContentRecord>({
    id: "preview",
    content_data: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 md:p-12">
        <MainContent 
          articleData={data} 
          type="posts" 
          routeTopic={null as any} 
        />
      </div>
    </div>
  );
}
