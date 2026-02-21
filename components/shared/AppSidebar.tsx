"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  LayoutGrid,
  Users,
  User,
  Activity,
  Bookmark,
  LibraryBig,
} from "lucide-react"
import { useSidebar } from "@/context/SidebarContext"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { fetchUserData, getUid } from "@/actions/auth"
import { User as UserType } from "@/types/api"

const NAV_ITEMS = [
  { icon: Home, label: "Feed", href: "/feed" },
  { icon: Bookmark, label: "Collection", href: "/collection" },
  { icon: Users, label: "Following", href: "/following" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Activity, label: "Analytic", href: "/analytic" },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, toggleSidebar } = useSidebar()
  const [userData, setUserData] = useState<UserType | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = await getUid()
        if (uid) {
          const data = await fetchUserData(uid)
          setUserData(data.data)
        }
      } catch (error) {
        console.log("Error occurred", error)
      }
    }
    fetchData()
  }, [])

  const hideSidebar =
    pathname === "/" ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/posts") ||
    pathname.startsWith("/edit")

  if (hideSidebar) return null

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-64px)] transition-all duration-300 bg-white dark:bg-black md:sticky flex-shrink-0 overflow-hidden",
          isSidebarOpen 
            ? "translate-x-0 w-64 border-r border-slate-100 dark:border-slate-900 opacity-100" 
            : "-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 border-none"
        )}
      >
        <div className="h-full overflow-y-auto px-6 py-6">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar()
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-primary text-white shadow-md shadow-orange-500/10 dark:shadow-none" 
                      : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon 
                    size={18}
                    className={cn(
                      "transition-transform duration-200",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                    )} 
                  />
                  <span className={cn(
                    "text-sm font-semibold transition-all"
                  )}>{item.label}</span>
                </Link>
              )
            })}

            {userData && (
              <>
                <div className="pt-6 pb-2 px-4">
                  <div className="h-px bg-slate-100 dark:bg-slate-900" />
                </div>
                
                <Link
                  href={`/author/@${userData.user_name}`}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar()
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                    pathname === `/author/@${userData.user_name}`
                      ? "bg-primary text-white shadow-md shadow-orange-500/10 dark:shadow-none" 
                      : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <LibraryBig 
                    size={18}
                    className={cn(
                      "transition-transform duration-200",
                      pathname === `/author/@${userData.user_name}` ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                    )} 
                  />
                  <span className="text-sm font-semibold">Your Works</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  )
}