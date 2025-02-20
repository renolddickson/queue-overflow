"use client"

import { useState } from "react"
import { Clock, ChevronRight, Info, ExternalLink } from "lucide-react"
import Navigation from "@/components/navigation"
import TableOfContents from "@/components/table-of-contents"
import CodeBlock from "@/components/code-block"
import type { Article, PlatformType } from "@/types"

const articleData: Article = {
  meta: {
    readingTime: "5m",
    publishDate: "15/11/2023",
    level: "Intermediate",
  },
  title: "Platform overview/ What is Playcart?",
  content:
    "Intro text l leo risus, porta ac consectetur ac, vestibulum at eros. Nullam quis risus eget urna mollis ornare vel eu leo. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.",
  topics: ["Article Topic 1", "Article Topic 2", "Article Topic 3", "Article Topic 4"],
  relatedArticles: ["Another Related Article 1", "Another Related Article 2", "Another Related Article 3"],
}

export default function Page() {
  const [selectedTab, setSelectedTab] = useState<PlatformType>("webapp")

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qKFoTPR0hM7zbjjY2Cbuu0NcORGjY7.png"
                alt="Logo"
                className="h-8 w-8"
              />
              <span className="font-semibold">Documentation</span>
            </div>
            <button className="text-sm text-blue-600">for Developers</button>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4 px-4">
            <div className="relative flex-1 max-w-xl">
              <input
                type="search"
                placeholder="What are you looking for?"
                className="w-full rounded-lg border px-4 py-2 pl-4 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <a href="#" className="text-blue-600 hover:underline">
              Back to playcart.com
            </a>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              Submit a request
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Left Sidebar */}
        <Navigation />

        {/* Main Content */}
        <main className="flex-1 px-8 py-6">
          <div className="mx-auto max-w-3xl">
            {/* Article Meta */}
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

            <h2 className="mb-4 text-xl font-semibold">Article Topic 1</h2>
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

            {/* Article Feedback */}
            <div className="mt-12 rounded-lg bg-gray-50 p-6 text-center">
              <h3 className="mb-4 text-lg font-medium">Was this article helpful?</h3>
              <div className="flex justify-center gap-4">
                <button className="rounded-lg border bg-white px-6 py-2 hover:bg-gray-50">Yes</button>
                <button className="rounded-lg border bg-white px-6 py-2 hover:bg-gray-50">No</button>
              </div>
            </div>

            {/* Related Articles */}
            <div className="mt-12">
              <h3 className="mb-4 text-lg font-medium">Also interesting</h3>
              <ul className="space-y-3">
                {articleData.relatedArticles.map((article) => (
                  <li key={article}>
                    <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                      <ChevronRight className="h-4 w-4" />
                      {article}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <TableOfContents topics={articleData.topics} />
      </div>
    </div>
  )
}

