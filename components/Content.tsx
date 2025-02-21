"use client"

import { articleData } from "@/constant";
import { PlatformType, TOC } from "@/types";
import { Clock, Info, ExternalLink } from "lucide-react";
import React, { useEffect, useState } from "react";
import CodeBlock from "./CodeBlock";
import TableOfContents from "./RightPanel";
import FeedBack from "./FeedBack";
import HistoryRoute from "./HistoryRoute";

const MainContent=() => {
  const [selectedTab, setSelectedTab] = useState<PlatformType>("webapp");
  const [headings, setHeadings] = useState<TOC[]>([]);
  useEffect(() => {
    const section = document.querySelector('section');
    if(section){
      const extractedHeadings = Array.from(section.querySelectorAll("h2, h3")).map(
        (heading) => ({
        id: heading.id,
        text: heading.textContent,
        level: heading.tagName === "H2" ? 0 : 2,
      })
    );
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
        <div className="flex items-center gap-1">
          {/* <Clock className="h-4 w-4" />
          <span>Reading time {articleData.meta.readingTime}</span> */}
        </div>
        <div>Published on {articleData.meta.publishDate}</div>
        {/* <div>Level: {articleData.meta.level}</div> */}
      </div>

      {/* Article Content */}
      <h1 className="mb-6 text-3xl font-bold">{articleData.title}</h1>

      <p className="mb-6 text-gray-600">{articleData.content}</p>

      <div className="mb-8 rounded-lg bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600" />
          <div>
            <p className="flex items-center gap-2 text-sm text-blue-600">
              There is more information on this topic on the marketeers page.
              <a href="#" className="flex items-center gap-1 font-medium hover:underline">
                Go to marketeer&apos;s page
                <ExternalLink className="h-4 w-4" />
              </a>
            </p>
          </div>
        </div>
      </div>

      <h2 id="article1" className="mb-4 text-xl font-semibold">Article Topic 1</h2>
      <p className="mb-6 text-gray-600">
        Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo,
        tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.
      </p>

      {/* Platform Tabs */}
      <div className="mb-4 border-b">
        <div className="flex gap-4">
          {["webapp", "ios", "android"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as PlatformType)}
              className={`border-b-2 px-4 py-2 text-sm ${
                selectedTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <CodeBlock />
      <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>Reading time {articleData.meta.readingTime}</span>
        </div>
        <div>Published {articleData.meta.publishDate}</div>
        <div>Level: {articleData.meta.level}</div>
      </div>

      {/* Article Content */}
      <h1 className="mb-6 text-3xl font-bold">{articleData.title}</h1>

      <p className="mb-6 text-gray-600">{articleData.content}</p>

      <div className="mb-8 rounded-lg bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600" />
          <div>
            <p className="flex items-center gap-2 text-sm text-blue-600">
              There is more information on this topic on the marketeers page.
              <a href="#" className="flex items-center gap-1 font-medium hover:underline">
                Go to marketeer&apos;s page
                <ExternalLink className="h-4 w-4" />
              </a>
            </p>
          </div>
        </div>
      </div>

      <h2 id="article2" className="mb-4 text-xl font-semibold">Article Topic 2</h2>
      <p className="mb-6 text-gray-600">
        Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo,
        tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.
      </p>

      {/* Platform Tabs */}
      <div className="mb-4 border-b">
        <div className="flex gap-4">
          {["webapp", "ios", "android"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as PlatformType)}
              className={`border-b-2 px-4 py-2 text-sm ${
                selectedTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <CodeBlock />
      </section>
      <HistoryRoute />
      <FeedBack />
    </div>
  </main>
  {headings && headings.length > 0 &&
  <TableOfContents topics={headings} />
  }
  </>
  );
};

export default MainContent;