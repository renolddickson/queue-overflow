"use client";

import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EngagementBarProps {
  id: string;
  initialUpvotes?: number;
  initialComments?: number;
}

const EngagementBar = ({ id, initialUpvotes = 0, initialComments = 0 }: EngagementBarProps) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);

  const handleUpvote = () => {
    if (isUpvoted) {
      setUpvotes(upvotes - 1);
    } else {
      setUpvotes(upvotes + 1);
      toast.success("Thanks for the upvote!");
    }
    setIsUpvoted(!isUpvoted);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="flex items-center gap-6 py-4 border-y border-slate-100 dark:border-slate-800 my-8">
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
  );
};

export default EngagementBar;
