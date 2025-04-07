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
import ImageBlock from "@/components/shared/ImageBlock";

const MainContent = ({ articleData, type, routeTopic }: { articleData: ContentRecord, type: 'blog' | 'doc', routeTopic: RouteConfig }) => {
  return (
    <>
      <main id="scroll-container" className={`editor-styles flex-1 px-4 sm:px-6 lg:px-8 py-6 ${type === 'blog' ? 'max-w-6xl mx-auto' : 'w-full'}`}>
        <div className="w-full max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
          {/* Article Meta */}
          <section className="w-full min-h-[calc(100vh-200px)]" id="content-container">
            <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
              {/* <div>Published on {articleData.meta.publishDate}</div> */}
            </div>
            {/* Article Content */}
            {/* <h1 className="mb-6 text-3xl font-bold">{articleData.heading}</h1> */}

            {articleData.content_data.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-12">
                {section.heading && (
                  <h2 className="mb-6 text-3xl font-bold" id={`heading_${sectionIndex}`}>{section.heading}</h2>
                )}
                {section.content.map((item, index) => {
                  switch (item.type) {
                    case "paragraph":
                      return (
                        <div key={index} className="mb-4">
                          <ParagraphRender html={item.content.data} />
                        </div>
                      );
                    case "heading2":
                      return (
                        <h2 key={index} className="mt-8 mb-4 text-xl font-semibold" id={`sub_heading_${index}`}>
                          {item.content.data}
                        </h2>
                      );
                    case "heading3":
                      return (
                        <h3 key={index} className="mt-6 mb-3 text-lg font-semibold" id={`sm_sub_heading_${index}`}>
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
                          <ImageBlock content={item.content.data || 'assets/no-image.jpg'} />
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
      {type == 'doc' &&
        <TableOfContents />
      }
    </>
  );
};

export default MainContent;
