"use client"

import { useEffect, useState } from "react"
import { getFollowedAuthors } from "@/actions/follow"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Users, Search, ArrowRight, User, FileText, Clock } from "lucide-react"
import Link from "next/link"
import { FollowButton } from "@/components/shared/FollowButton"
import { toast } from "sonner"
import Image from "next/image"

export default function FollowingPage() {
  const [authors, setAuthors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadAuthors = async () => {
    try {
      const res = await getFollowedAuthors()
      if (res.data) setAuthors(res.data)
    } catch (error) {
      toast.error("Failed to load followed authors")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuthors()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  return (
    <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold dark:text-white">Following</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-2">Authors and creators you&apos;re keeping an eye on</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
          <Users size={24} />
        </div>
      </div>

      {authors.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {authors.map((author) => (
            <Card key={author.user_id} className="bg-white dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 hover:border-slate-200 dark:hover:border-zinc-700 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <Link href={`/author/@${author.user_name}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative h-16 w-16 shrink-0">
                      {author.profile_image ? (
                        <Image
                          src={author.profile_image}
                          alt={author.display_name}
                          fill
                          className="rounded-full object-cover border-2 border-slate-100 dark:border-zinc-800 group-hover:border-primary/50 transition-colors"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <User size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold dark:text-white truncate group-hover:text-primary transition-colors">
                        {author.display_name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-zinc-400">@{author.user_name}</p>
                      {author.latest_content ? (
                        <Link 
                          href={`/posts/${author.latest_content.id}`}
                          className="mt-3 block p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 hover:border-primary/30 transition-all group/post"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FileText size={12} className="text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latest Post</span>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 line-clamp-1 group-hover/post:text-primary transition-colors">
                            {author.latest_content.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                            <Clock size={10} />
                            <span>{new Date(author.latest_content.created_at).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      ) : (
                        author.bio && (
                          <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1 line-clamp-1 italic">
                            {author.bio}
                          </p>
                        )
                      )}
                    </div>
                  </Link>
                  <div className="shrink-0 flex items-center gap-3">
                    <FollowButton targetUserId={author.user_id} initialIsFollowing={true} />
                    <Link href={`/author/@${author.user_name}`}>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                        <ArrowRight size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-zinc-800">
          <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm">
            <Search className="text-slate-300 w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Not following anyone yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2 mx-auto">
            Discover amazing creators and their stories in the feed.
          </p>
          <Link href="/feed" className="mt-8 inline-block">
            <Button className="rounded-full px-10 h-12 font-bold gap-2">
              Explore Feed <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      )}
    </main>
  )
}
