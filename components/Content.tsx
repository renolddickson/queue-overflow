/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import CodeBlock from "./shared/CodeBlock";
import TableOfContents from "./common/RightPanel";
// import FeedBack from "./common/FeedBack";
// import HistoryRoute from "./common/HistoryRoute";
import QuotesBlock from "./shared/QuotesBlock";
import WarningBox from "./shared/WarningBox";
import { ContentRecord } from "@/types/api";

const MainContent = ({ articleData }: { articleData: ContentRecord }) => {
  
  return (
    <>
      <main className="flex-1 px-8 py-6">
        <div className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl 2xl:max-w-3xl">
          {/* Article Meta */}
          <section className="w-full" id="content-container">
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
                        <p
                          key={index}
                          className="mb-6 text-gray-600"
                          dangerouslySetInnerHTML={{ __html: item.content.data }}
                        ></p>
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
          {/* {articleData.routeTopic && <HistoryRoute routeConfig={articleData.routeTopic} />}
          {articleData.relatedArticles && <FeedBack relatedArticles={articleData.relatedArticles} />} */}
        </div>
      </main>
      <TableOfContents />
    </>
  );
};

export default MainContent;
