'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toggleFollow } from '@/actions/follow';
import { getUid } from '@/actions/auth';
import { toast } from 'sonner';
import { Loader2, UserMinus, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  className?: string;
}

export function FollowButton({ targetUserId, initialIsFollowing, className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  useEffect(() => {
    getUid().then(setCurrentUid);
  }, []);

  const handleFollowToggle = async () => {
    startTransition(async () => {
      try {
        const result = await toggleFollow(targetUserId);
        if (result.success) {
          setIsFollowing(result.followed ?? false);
          toast.success(result.followed ? 'Following' : 'Unfollowed');
        } else {
          toast.error(result.error || 'Failed to update follow status');
        }
      } catch (error) {
        console.error('Follow toggle error:', error);
        toast.error('An unexpected error occurred');
      }
    });
  };

  if (currentUid === targetUserId) return null;

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isPending}
      className={cn(
        "px-6 py-2.5 rounded-full font-semibold shadow-lg transition-all active:scale-95 flex items-center gap-2",
        isFollowing 
          ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-zinc-700" 
          : "bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 hover:scale-105",
        className
      )}
    >
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus size={18} />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus size={18} />
          Follow
        </>
      )}
    </Button>
  );
}
