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
import { CollectionDropdown } from "@/components/shared/CollectionDropdown"

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
  const upvotes = data.upvotes || 0
  const comments = data.comments_count || 0
  const date = data.created_at ? getRelativeTime(data.created_at) : "recently"
  
  // Extract category or default
  const category = data.category || (data.type === 'docs' ? 'Documentation' : 'Technical Story')

  return (
    <div className="group py-12 first:pt-0 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-all">
      <div className="flex flex-col gap-6">
        
        {/* Row 1: Content and Image */}
        <div className="flex flex-row gap-8 items-start justify-between overflow-hidden">
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
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight hover:text-slate-600 dark:hover:text-slate-300 transition-colors break-words">
                  {data.title}
                </h2>
              </Link>
              <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-lg leading-relaxed md:max-w-[95%]">
                {data.description || "Choose design patterns based on pain points: apply the right pattern with minimal over-engineering in any OO language."}
              </p>
            </div>
          </div>

          {/* Right Side: Image Thumbnail */}
          {data.cover_image && (
            <Link 
              href={`/${data.type}/${data.id}`}
              className="w-24 md:w-32 lg:w-40 aspect-[4/3] relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex-shrink-0 shadow-sm"
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

        {/* Row 2: Footer: Stats and Actions */}
        <div className="flex items-center justify-between pt-2 w-full">
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
            <CollectionDropdown documentId={data.id} iconSize={20} />
          </div>
        </div>
      </div>
    </div>
  )
}
