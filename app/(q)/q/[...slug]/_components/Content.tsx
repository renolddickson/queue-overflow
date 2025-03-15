/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
// import FeedBack from "./common/FeedBack";
// import HistoryRoute from "./common/HistoryRoute";
import { ContentRecord } from "@/types/api";
import QuotesBlock from "@/components/shared/QuotesBlock";
import WarningBox from "@/components/shared/WarningBox";
import CodeBlock from "@/components/shared/CodeBlock";
import { ParagraphRender } from "./ParagraphRender";
import TableOfContents from "@/components/common/RightPanel";
import HistoryRoute from "@/components/common/HistoryRoute";
import { RouteConfig } from "@/types";

const MainContent = ({ articleData,type,routeTopic }: { articleData: ContentRecord,type:'blog' | 'doc',routeTopic:RouteConfig }) => {
  return (
    <>
      <main className={`flex-1 px-8 py-6 ${type === 'blog' ? 'max-w-4xl mx-auto' : ''}`}>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Article Meta */}
          <section className="w-full min-h-[calc(100vh-200px)]" id="content-container">
            <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
              {/* <div>Published on {articleData.meta.publishDate}</div> */}
            </div>
            {/* Article Content */}
            {/* <h1 className="mb-6 text-3xl font-bold">{articleData.heading}</h1> */}
            
            {articleData.content_data.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.heading && (
                  <h2 className="mb-6 text-3xl font-bold" id={`heading_${sectionIndex}`}>{section.heading}</h2>
                )}
                {section.content.map((item, index) => {
                  switch (item.type) {
                    case "paragraph":
                      return (
                         <ParagraphRender key={index} html={item.content.data} />
                      );
                    case "heading2":
                      return (
                        <h2 key={index} className="mb-4 text-xl font-semibold" id={`sub_heading_${index}`}>
                          {item.content.data}
                        </h2>
                      );
                    case "heading3":
                      return (
                        <h3 key={index} className="mb-4 text-lg font-semibold" id={`sm_sub_heading_${index}`}>
                          {item.content.data}
                        </h3>
                      );
                    case "warningBox":
                      return <WarningBox key={index} content={item.content} />;
                    case "codeBlock":
                      return <CodeBlock key={index} content={item.content} />;
                    case "quote":
                      return <QuotesBlock key={index} content={item.content} />;
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
      {type == 'doc' &&
      <TableOfContents />
      }
    </>
  );
};

export default MainContent;
