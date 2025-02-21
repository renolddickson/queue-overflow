import { articleData } from '@/constant'
import { ChevronRight, ThumbsDown, ThumbsUp } from 'lucide-react'
import React from 'react'

const FeedBack = () => {
  return (
    <>
          {/* Article Feedback */}
          <div className="mt-12 rounded-lg bg-gray-50 p-6 text-center">
          <h3 className="mb-4 text-lg font-medium">Was this article helpful?</h3>
          <div className="flex justify-center gap-6">
          <ThumbsUp className="h-6 w-6 transition-transform duration-300 hover:scale-110 hover:-rotate-6" />
          <ThumbsDown className="h-6 w-6 transition-transform duration-300 hover:scale-110 hover:rotate-6" />
            {/* <button className="rounded-lg border bg-white px-6 py-2 hover:bg-gray-50">Yes</button>
            <button className="rounded-lg border bg-white px-6 py-2 hover:bg-gray-50">No</button> */}
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
        </>
  )
}

export default FeedBack