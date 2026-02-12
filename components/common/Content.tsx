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
    <>
      <main id="scroll-container" className={`editor-styles flex-1 py-12 ${type === 'docs' ? 'max-w-6xl mx-auto' : 'w-full'} max-w-full bg-white dark:bg-slate-950`}>
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <EngagementBar id={articleData.id} />
          {/* Article Meta */}
          <section className="w-full min-h-[calc(100vh-200px)]" id="content-container">
            <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
              {/* <div>Published on {articleData.meta.publishDate}</div> */}
            </div>
            {/* Article Content */}
            {/* <h1 className="mb-6 text-3xl font-bold">{articleData.heading}</h1> */}

            {articleData.content_data.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-20 last:mb-0">
                {section.heading.trim() && (
                  <h2
                    className={`mb-10 font-serif font-bold text-slate-900 dark:text-slate-50 leading-tight ${sectionIndex === 0 ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl'}`}
                    id={`heading_${sectionIndex}`}
                  >
                    {section.heading}
                  </h2>
                )}
                {section.content.map((item, index) => {
                  switch (item.type) {
                    case "paragraph":
                      return (
                        <div
                          key={index}
                          className="mb-6 text-xl leading-relaxed font-normal text-slate-700 dark:text-slate-300 font-serif"
                        >
                          <ParagraphRender html={item.content.data} />
                        </div>
                      );
                    case "heading2":
                      return (
                        <h2
                          key={index}
                          id={`sub_heading_${index}`}
                          className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-6 mt-12"
                        >
                          {item.content.data}
                        </h2>
                      );
                    case "heading3":
                      return (
                        <h3
                          key={index}
                          id={`sm_sub_heading_${index}`}
                          className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-4 mt-8"
                        >
                          {item.content.data}
                        </h3>
                      );
                    case "warningBox":
                      return (
                        <div key={index} className="my-6">
                          <WarningBox content={item.content} />
                        </div>
                      );
                    case "codeBlock":
                      return (
                        <div key={index} className="my-6">
                          <CodeBlock content={item.content} />
                        </div>
                      );
                    case "quote":
                      return (
                        <div key={index} className="my-6">
                          <QuotesBlock content={item.content} />
                        </div>
                      );
                    case "image":
                      return (
                        <div key={index} className="my-6">
                          <ImageBlock content={item.content} />
                        </div>
                      );
                    case "divider":
                      return (
                        <div key={index} className="py-12">
                          <hr className="border-slate-200 dark:border-slate-800 w-1/4 mx-auto border-2" />
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
          </section>
          {routeTopic && <HistoryRoute routeConfig={routeTopic} />}
          {/* {articleData.relatedArticles && <FeedBack relatedArticles={articleData.relatedArticles} />} */}
        </div>
      </main>
      {type == 'posts' &&
        <TableOfContents />
      }
    </>
  );
};

export default MainContent;
