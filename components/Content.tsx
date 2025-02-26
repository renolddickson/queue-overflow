"use client"

import { articleData } from "@/constant";
import { TOC } from "@/types";
import React, { useEffect, useState } from "react";
import CodeBlock from "./shared/CodeBlock";
import TableOfContents from "./RightPanel";
import FeedBack from "./FeedBack";
import HistoryRoute from "./HistoryRoute";
import QuotesBlock from "./shared/QuotesBlock";
import WarningBox from "./shared/WarningBox";

const MainContent = () => {
  const [headings, setHeadings] = useState<TOC[]>([]);

  useEffect(() => {
    const section = document.querySelector('section');
    console.log(section);
    
    if (section) {
      const extractedHeadings = Array.from(section.querySelectorAll("h2, h3"))
        .map((heading) => heading.id && heading.textContent ? {
          id: heading.id,
          text: heading.textContent || null,
          level: heading.tagName === "H2" ? 0 : 2,
        } : null)
        .filter((heading): heading is TOC => heading !== null);
      setHeadings(extractedHeadings);
    }
    console.log(section);
    
  }, []);

  return (
    <>
      <main className="flex-1 px-8 py-6">
        <div className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl 2xl:max-w-3xl">
          {/* Article Meta */}
          <section className="w-full">
            <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
              <div>Published on {articleData.meta.publishDate}</div>
            </div>

            {/* Article Content */}
            <h1 className="mb-6 text-3xl font-bold">{articleData.title}</h1>
            {articleData.content.map((item, index) => {
              switch (item.type) {
                case 'paragraph':
                  return <p key={index} className="mb-6 text-gray-600" dangerouslySetInnerHTML={{__html:item.content.data}}></p>;
                case 'heading2':
                  return <h2 key={index} className="mb-4 text-xl font-semibold" id={'heading_'+index}>{item.content.data}</h2>;
                case 'heading3':
                  return <h3 key={index} className="mb-4 text-lg font-semibold">{item.content.data}</h3>;
                case 'warningBox':
                  return <WarningBox key={index} content={item.content} />
                case 'codeBlock':
                  return <CodeBlock key={index} content={item.content} />;
                case 'quote':
                  return <QuotesBlock key={index} content={item.content} />;
                // case 'table':
                //   return <Table key={index} data={item.content} />;
                // case 'graph':
                //   return <Graph key={index} data={item.content} />;
                // case 'accordion':
                //   return <Accordion key={index} items={item.content} />;
                // case 'tab':
                //   return <TabComponent key={index} tabs={item.content} />;
                default:
                  return null;
              }
            })}
          </section>
          {articleData.routeTopic &&
          <HistoryRoute routeConfig={articleData.routeTopic} />
          }
          {articleData.relatedArticles &&
          <FeedBack relatedArticles={articleData.relatedArticles}/>
          }
        </div>
      </main>
      <TableOfContents topics={headings} />
    </>
  );
};

export default MainContent;
