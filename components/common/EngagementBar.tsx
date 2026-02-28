"use client";

import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from '@/components/common/Image';
import Link from 'next/link';
import { FollowButton } from '@/components/shared/FollowButton';
import { toggleUpvote, getUpvoteStatus } from '@/actions/document';
import { ShareDialog } from '@/components/shared/ShareDialog';
import { useEffect } from 'react';

interface EngagementBarProps {
  id: string;
  initialUpvotes?: number;
  initialComments?: number;
  variant?: 'horizontal' | 'vertical';
  author?: {
    user_id: string;
    user_name: string;
    profile_image: string;
    display_name: string;
  };
  initialIsFollowing?: boolean;
}

const EngagementBar = ({ 
  id, 
  initialUpvotes = 0, 
  initialComments = 0, 
  variant = 'horizontal',
  author,
  initialIsFollowing = false
}: EngagementBarProps) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
    const fetchStatus = async () => {
      const { upvoted } = await getUpvoteStatus(id);
      setIsUpvoted(upvoted);
    };
    fetchStatus();
  }, [id]);

  const handleUpvote = async () => {
    // Optimistic UI
    const newUpvoted = !isUpvoted;
    const newCount = newUpvoted ? upvotes + 1 : upvotes - 1;
    setIsUpvoted(newUpvoted);
    setUpvotes(newCount);

    try {
      const result = await toggleUpvote(id);
      if (!result.success) {
        // Revert on error
        setIsUpvoted(!newUpvoted);
        setUpvotes(upvotes);
        toast.error(result.error || "Failed to upvote");
      }
    } catch (error) {
      setIsUpvoted(!newUpvoted);
      setUpvotes(upvotes);
      toast.error("An error occurred");
    }
  };

  const handleShare = () => {
    setIsShareOpen(true);
  };

  if (variant === 'vertical') {
    return (
      <>
        <div className="flex flex-col items-center gap-6 py-6 border-slate-100 dark:border-slate-800">
          {/* Author Profile with Hover Effect */}
          {author && (
            <div className="group/author relative mb-2">
              <Link 
                href={`/author/@${author.user_name}`}
                className="relative block w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all cursor-pointer ring-offset-2 ring-offset-white dark:ring-offset-slate-950 hover:ring-2 ring-orange-100 dark:ring-orange-900 shadow-sm"
              >
                <Image 
                  src={author.profile_image || '/assets/no-avatar.png'} 
                  alt={author.display_name || 'Author'}
                  fill
                  className="object-cover"
                  loading="eager"
                />
              </Link>

              {/* Hover Panel */}
              <div className="absolute left-full ml-4 top-0 opacity-0 invisible group-hover/author:opacity-100 group-hover/author:visible transition-all duration-300 translate-x-2 group-hover/author:translate-x-0 z-50">
                <div className="w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                       <Image 
                          src={author.profile_image || '/assets/no-avatar.png'} 
                          alt={author.display_name}
                          fill
                          className="object-cover"
                        />
                     </div>
                     <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{author.display_name}</p>
                        <p className="text-xs text-slate-500 truncate">@{author.user_name}</p>
                     </div>
                  </div>
                  <FollowButton 
                    targetUserId={author.user_id} 
                    initialIsFollowing={initialIsFollowing} 
                    className="w-full h-9 text-xs" 
                  />
                </div>
                {/* Tooltip Arrow */}
                <div className="absolute top-4 -left-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-l border-b border-slate-100 dark:border-slate-800 rotate-45" />
              </div>
            </div>
          )}

          <div className="h-px w-8 bg-slate-200 dark:bg-slate-800 mb-2" />

          <div className="flex flex-col items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-11 w-11 rounded-full transition-all active:scale-90 ${isUpvoted ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              onClick={handleUpvote}
            >
              <ThumbsUp size={20} className={isUpvoted ? 'fill-current' : ''} />
            </Button>
            <span className="text-xs font-bold text-slate-500">{upvotes >= 1000 ? `${(upvotes/1000).toFixed(1)}K` : upvotes}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-11 w-11 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
              onClick={() => toast.info("Comments section coming soon!")}
            >
              <MessageSquare size={20} />
            </Button>
            <span className="text-xs font-bold text-slate-500">{initialComments}</span>
          </div>

          <div className="h-px w-8 bg-slate-200 dark:bg-slate-800 my-2" />

          <div className="flex flex-col items-center gap-2">
              <Button 
              variant="ghost" 
              size="icon" 
              className="h-11 w-11 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
              onClick={handleShare}
              title="Share"
              >
              <Share2 size={20} />
              </Button>

              <Button 
              variant="ghost" 
              size="icon" 
              className="h-11 w-11 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
              onClick={() => toast.success("Saved to bookmarks!")}
              title="Save"
              >
              <Bookmark size={20} />
              </Button>
          </div>
        </div>
        <ShareDialog 
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          url={shareUrl}
          title={author?.display_name ? `Check out this story by ${author.display_name}` : "Check out this story!"}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-6 px-4 py-4 border-b border-slate-100 dark:border-slate-800">
        {/* Author Profile for Horizontal Layout */}
        {author && (
          <Link 
            href={`/author/@${author.user_name}`}
            className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 flex-shrink-0"
          >
            <Image 
              src={author.profile_image || '/assets/no-avatar.png'} 
              alt={author.display_name}
              fill
              className="object-cover"
            />
          </Link>
        )}

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-2 rounded-full ${isUpvoted ? 'text-primary bg-primary/10' : 'text-slate-500'}`}
            onClick={handleUpvote}
          >
            <ThumbsUp size={18} className={isUpvoted ? 'fill-current' : ''} />
            <span className="font-medium">{upvotes}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-slate-500 rounded-full"
            onClick={() => toast.info("Comments section coming soon!")}
          >
            <MessageSquare size={18} />
            <span className="font-medium">{initialComments}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-500 rounded-full md:px-4"
            onClick={handleShare}
          >
            <Share2 size={18} />
            <span className="hidden md:inline ml-2">Share</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-500 rounded-full"
            onClick={() => toast.success("Saved to bookmarks!")}
          >
            <Bookmark size={18} />
          </Button>
        </div>
      </div>
      <ShareDialog 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={shareUrl}
        title={author?.display_name ? `Check out this story by ${author.display_name}` : "Check out this story!"}
      />
    </>
  );
};

export default EngagementBar;
