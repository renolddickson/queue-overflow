"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getFollowers, getFollowing } from "@/actions/follow";
import { User } from "@/types/api";
import Image from "@/components/common/Image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface UserListDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  userId: string;
  type: "followers" | "following";
}

export function UserListDialog({
  isOpen,
  onOpenChange,
  title,
  userId,
  type,
}: UserListDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const result = type === "followers" 
            ? await getFollowers(userId) 
            : await getFollowing(userId);
          setUsers(result.data || []);
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-1">
              {users.map((user) => (
                <Link
                  key={user.user_id}
                  href={`/author/@${user.user_name}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden relative border border-slate-200 dark:border-slate-800">
                    <Image
                      src={user.profile_image || "/assets/no-avatar.png"}
                      fill
                      className="object-cover"
                      alt={user.display_name || user.user_name || "user"}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {user.display_name || user.user_name}
                    </span>
                    <span className="text-xs text-slate-500">@{user.user_name}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-slate-500 italic text-sm">
              No users found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
