import React from "react";
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
import { Book } from "lucide-react";

const MainContent = ({ articleData, type, routeTopic }: { articleData: ContentRecord | null, type: 'docs' | 'posts', routeTopic: RouteConfig }) => {
  if (!articleData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-slate-500">
        <div className="text-xl font-serif italic text-center px-6">
          This section is currently being written or is not available.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row w-full gap-12">
      <main id="scroll-container" className={cn(
        "editor-styles flex-1 min-w-0 bg-white dark:bg-slate-950",
        type === 'docs' ? "" : "max-w-4xl mx-auto py-12 px-6"
      )}>
        <div className="w-full">
            {type === 'docs' && (
                <div className="flex items-center gap-2 mb-6 text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                    <span>GET STARTED</span>
                </div>
            )}
            
          <EngagementBar id={articleData.id} />
          
          <section className="w-full" id="content-container">
            {articleData.content_data.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-16 last:mb-0">
                {section.heading.trim() && (
                  <h2
                    className={cn(
                        "font-serif font-bold text-slate-900 dark:text-slate-50 leading-tight mb-8",
                        sectionIndex === 0 ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl mt-12"
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
                            id={`sub_heading_${index}`}
                            className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-6 mt-12"
                            >
                            {item.content.data}
                            </h2>
                        );
                        case "heading3":
                        return (
                            <h3
                            key={index}
                            id={`sm_sub_heading_${index}`}
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
      
      {/* Page Navigation Sidebar */}
      <div className="hidden min-[1200px]:block w-64 shrink-0">
        <TableOfContents />
      </div>
    </div>
  );
};

export default MainContent;
