"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Paperclip, Star, User as UserIcon } from "lucide-react"
import { User } from "@/types/api"
import { signOut } from "@/actions/auth"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface UserDropdownProps {
  user: User | null
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  if (!user || !user.user_id) {
    return (
      <Link href="/auth">
        <Button variant="ghost">Login</Button>
      </Link>
    )
  }
  const routeTo =(url:string)=>{
    router.push(url)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          {user.profile_image ? (
            <Image
              unoptimized
              src={user.profile_image || "/placeholder.svg"}
              alt={user.user_name || "User"}
              fill
              className="h-8 w-8 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="h-8 min-w-8 rounded-full border border-border bg-muted flex items-center justify-center">
              <UserIcon className="h-4 w-4" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email || ""}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={()=>routeTo('/profile')}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={()=>routeTo(`/author/${user.user_id}`)}>
          <Paperclip className="mr-2 h-4 w-4" />
          <span>My Docs</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={()=>routeTo(`/feedback`)}>
          <Star className="mr-2 h-4 w-4" />
          <span>Feedback</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

