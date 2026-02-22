"use client"

import { FeedData } from "@/types/api"
import Link from "next/link"
import Image from "@/components/common/Image"
import { 
  MessageSquare, 
  ThumbsUp, 
  Bookmark, 
  MoreHorizontal, 
  Sparkles,
  ChevronDown
} from "lucide-react"

interface FeedItemProps {
  data: FeedData
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function FeedItem({ data }: FeedItemProps) {
  const upvotes = data.upvotes ?? (data.title.length * 3) % 45
  const comments = data.comments_count ?? (data.title.length * 2) % 12
  const date = data.updated_at ? getRelativeTime(data.updated_at) : "recently"
  
  // Extract category or default
  const category = data.category || (data.type === 'docs' ? 'Documentation' : 'Technical Story')

  return (
    <div className="group py-12 first:pt-0 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-all">
      <div className="flex flex-col-reverse md:flex-row gap-8 md:items-start justify-between">
        
        {/* Left Side: Content */}
        <div className="flex-1 space-y-4 min-w-0">
          
          {/* Header: Author and Category */}
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-800">
               <Image 
                src={data.user?.profile_image ?? '/assets/no-avatar.png'} 
                alt="author"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-slate-500">In</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 hover:text-primary transition-colors cursor-pointer">
                {category}
              </span>
              <span className="text-slate-500">by</span>
              <Link 
                href={`/author/@${data.user?.user_name}`}
                className="font-medium text-slate-900 dark:text-slate-100 hover:underline transition-all"
              >
                {data.user?.display_name || data.user?.user_name || 'Anonymous'}
              </Link>
              <Sparkles size={14} className="text-yellow-500 ml-0.5" />
            </div>
          </div>

          {/* Title and Excerpt */}
          <div className="space-y-2">
             <Link href={`/${data.type}/${data.id}`}>
               <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {data.title}
               </h2>
             </Link>
             <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-lg leading-relaxed md:max-w-[95%]">
                {data.description || "Choose design patterns based on pain points: apply the right pattern with minimal over-engineering in any OO language."}
             </p>
          </div>

          {/* Footer: Stats and Actions */}
          <div className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-5 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Sparkles size={16} className="text-yellow-500 fill-yellow-500" />
              <span>{date}</span>
              <div className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer">
                <ThumbsUp size={18} className="text-slate-400 dark:text-slate-500" />
                <span>{upvotes >= 1000 ? `${(upvotes/1000).toFixed(1)}K` : upvotes}</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer">
                <MessageSquare size={18} className="text-slate-400 dark:text-slate-500" />
                <span>{comments}</span>
              </div>
            </div>

            <div className="flex items-center gap-5 text-slate-400 dark:text-slate-500">
              <button className="hover:text-slate-900 dark:hover:text-white transition-colors" title="Show less like this">
                 <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center relative">
                    <div className="w-3 h-0.5 bg-slate-300 dark:bg-slate-700" />
                 </div>
              </button>
              <button className="hover:text-slate-900 dark:hover:text-white transition-colors" title="Save to reading list">
                 <Bookmark size={22} />
              </button>
              <button className="hover:text-slate-900 dark:hover:text-white transition-colors">
                 <MoreHorizontal size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Image Thumbnail */}
        {data.cover_image && (
          <Link 
            href={`/${data.type}/${data.id}`}
            className="w-full md:w-40 lg:w-48 aspect-[4/3] relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex-shrink-0"
          >
            <Image 
              src={data.cover_image}
              alt={data.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        )}
      </div>
    </div>
  )
}
