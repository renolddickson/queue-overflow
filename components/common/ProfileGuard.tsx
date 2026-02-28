"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { User } from "@/types/api";

export default function ProfileGuard({ userProfile }: { userProfile: Partial<User> | null }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (userProfile && !userProfile.user_name && !pathname.startsWith("/profile")) {
      router.push("/profile?incomplete=true");
    }
  }, [userProfile, pathname, router]);

  return null;
}
