"use client"

import { articleData } from "@/constant";
import { PlatformType, TOC } from "@/types";
import { Clock, Info, ExternalLink } from "lucide-react";
import React, { useEffect, useState } from "react";
import CodeBlock from "./shared/CodeBlock";
import TableOfContents from "./RightPanel";
import FeedBack from "./FeedBack";
import HistoryRoute from "./HistoryRoute";

const MainContent = () => {
  const [selectedTab, setSelectedTab] = useState<PlatformType>("webapp");
  const [headings, setHeadings] = useState<TOC[]>([]);

  useEffect(() => {
    const section = document.querySelector('section');
    if (section) {
      const extractedHeadings = Array.from(section.querySelectorAll("h2, h3"))
        .map((heading) => heading.id && heading.textContent ? {
          id: heading.id,
          text: heading.textContent,
          level: heading.tagName === "H2" ? 0 : 2,
        } : null)
        .filter((heading): heading is TOC => heading !== null);
      setHeadings(extractedHeadings);
    }
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
                  return <p key={index} className="mb-6 text-gray-600">{item.content}</p>;
                case 'heading2':
                  return <h2 key={index} className="mb-4 text-xl font-semibold">{item.content}</h2>;
                case 'heading3':
                  return <h3 key={index} className="mb-4 text-lg font-semibold">{item.content}</h3>;
                case 'warningBox':
                  return (
                    <div key={index} className="mb-8 rounded-lg bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-blue-600">{item.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                case 'codeBlock':
                  return <CodeBlock key={index} content={item.content} />;
                case 'quote':
                  return <blockquote key={index} className="mb-6 italic">{item.content}</blockquote>;
                case 'table':
                  return <Table key={index} data={item.content} />;
                case 'graph':
                  return <Graph key={index} data={item.content} />;
                case 'accordion':
                  return <Accordion key={index} items={item.content} />;
                case 'tab':
                  return <TabComponent key={index} tabs={item.content} />;
                default:
                  return null;
              }
            })}
          </section>
          <HistoryRoute />
          <FeedBack />
        </div>
      </main>
      {headings.length > 0 && <TableOfContents topics={headings} />}
    </>
  );
};

export default MainContent;
