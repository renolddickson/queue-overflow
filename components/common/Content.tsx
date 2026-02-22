"use client";

import React, { useState, useEffect } from "react";
// import FeedBack from "./common/FeedBack";
// import HistoryRoute from "./common/HistoryRoute";
import { ContentRecord } from "@/types/api";
import QuotesBlock from "@/components/shared/QuotesBlock";
import WarningBox from "@/components/shared/WarningBox";
import CodeBlock from "@/components/shared/CodeBlock";
import { ParagraphRender } from "@/app/(q)/_components/ParagraphRender";
import TableOfContents from "@/components/common/RightPanel";
import HistoryRoute from "@/components/common/HistoryRoute";
import { RouteConfig } from "@/types";
import ImageBlock from "@/components/shared/ImageBlock";
import EngagementBar from "./EngagementBar";
import { cn } from "@/lib/utils";
import { Book, Eye, Edit } from "lucide-react";
import PreviewHandler from "./PreviewHandler";
import Link from 'next/link';
import { getUid } from '@/actions/auth';

const MainContent = ({ 
  articleData: initialData, 
  type, 
  routeTopic,
  author,
  docId // Pass docId to construct edit URL
}: { 
  articleData: ContentRecord | null, 
  type: 'docs' | 'posts', 
  routeTopic: RouteConfig,
  author?: {
    user_id?: string; // Add user_id to author for permission check
    user_name: string;
    profile_image: string;
    display_name: string;
  },
  docId?: string
}) => {
  const [articleData, setArticleData] = useState<ContentRecord | null>(initialData);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const isPreview = articleData?.id === "preview";

  useEffect(() => {
    getUid().then(setCurrentUid);
  }, []);

  const isAuthor = !isPreview && author?.user_id && currentUid === author.user_id;

  if (!articleData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-slate-500">
        <PreviewHandler onPreview={setArticleData} />
        <div className="text-xl font-serif italic text-center px-6">
          This section is currently being written or is not available.
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-row w-full gap-4 lg:gap-16 relative",
      type === 'posts' ? "justify-center" : "justify-start"
    )}>
      <PreviewHandler onPreview={setArticleData} />

      {/* Left Sticky Engagement Bar */}
      <aside className="hidden lg:block w-fit shrink-0 relative z-[60]">
        <div className="sticky top-32 flex flex-col items-center gap-6">
          <EngagementBar id={articleData.id} variant="vertical" author={author} />
          
          {isAuthor && docId && (
            <Link 
              href={`/edit/${type}/${docId}${type === 'docs' ? `/${articleData.id}` : ''}`}
              className="group/edit flex flex-col items-center gap-1 transition-all"
            >
              <div className="w-11 h-11 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-500 shadow-sm hover:scale-110 active:scale-95 transition-all">
                <Edit size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-orange-600 dark:text-orange-500 opacity-0 group-hover/edit:opacity-100 transition-opacity">Edit</span>
            </Link>
          )}
        </div>
      </aside>

      <main id="scroll-container" className={cn(
        "editor-styles flex-1 min-w-0 bg-white dark:bg-slate-950",
        "max-w-3xl" // Limit content width for readability and tight layout
      )}>
        <div className="w-full">
          {/* Horizontal Engagement Bar - Only for Posts Mobile/Tablet */}
          {type === 'posts' && !isPreview && (
            <div className="lg:hidden">
                <EngagementBar id={articleData.id} author={author} />
            </div>
          )}
          
          <section className="w-full" id="content-container">
            {articleData.content_data.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-16 last:mb-0">
                {section.heading?.trim() && (
                  <h2
                    className={cn(
                        "font-serif font-bold text-slate-900 dark:text-slate-50 leading-tight tracking-tight",
                        sectionIndex === 0 
                            ? "text-6xl md:text-7xl mb-12 mt-10 border-b-2 border-slate-50 dark:border-slate-900 pb-8" 
                            : "text-2xl md:text-3xl mt-20 mb-8"
                    )}
                    id={`heading_${sectionIndex}`}
                  >
                    {sectionIndex === 0 && type === 'docs' && (
                         <div className="mb-4 text-orange-600 dark:text-orange-500">
                            {/* Potential Icon placeholder */}
                         </div>
                    )}
                    {section.heading}
                  </h2>
                )}
                
                <div className="space-y-6">
                    {section.content.map((item, index) => {
                    switch (item.type) {
                        case "paragraph":
                        return (
                            <div
                            key={index}
                            className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-sans"
                            >
                            <ParagraphRender html={item.content.data} />
                            </div>
                        );
                        case "heading2":
                        return (
                            <h2
                            key={index}
                            id={`sub_heading_${sectionIndex}_${index}`}
                            className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-6 mt-12"
                            >
                            {item.content.data}
                            </h2>
                        );
                        case "heading3":
                        return (
                            <h3
                            key={index}
                            id={`sm_sub_heading_${sectionIndex}_${index}`}
                            className="text-xl font-sans font-bold text-slate-800 dark:text-slate-100 mb-4 mt-8"
                            >
                            {item.content.data}
                            </h3>
                        );
                        case "warningBox":
                        return <WarningBox key={index} content={item.content} />;
                        case "codeBlock":
                        return <CodeBlock key={index} content={item.content} />;
                        case "quote":
                        return <QuotesBlock key={index} content={item.content} />;
                        case "image":
                        return <ImageBlock key={index} content={item.content} />;
                        case "divider":
                        return (
                            <div key={index} className="py-8">
                                <hr className="border-slate-100 dark:border-slate-900 w-full mx-auto" />
                            </div>
                        );
                        default:
                        return null;
                    }
                    })}
                </div>
              </div>
            ))}
          </section>
          
          <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800/50">
            {routeTopic && <HistoryRoute routeConfig={routeTopic} />}
          </div>
        </div>
      </main>
      
      {/* Page Navigation Sidebar - Only for Posts */}
      {type === 'posts' && (
        <div className="hidden min-[1300px]:block w-64 shrink-0">
          <TableOfContents />
        </div>
      )}
    </div>
  );
};

export default MainContent;
