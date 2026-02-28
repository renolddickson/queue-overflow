"use client"
import { Menu, SquarePen, Bell, X, TextAlignStart } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { fetchUserData, getUid } from '@/actions/auth';
import UserDropdown from '../ui/UserDropDown';
import { User } from '@/types/api';
import { useHasMounted } from '@/hooks/useHasMounted'
import { useSidebar } from '@/context/SidebarContext';
import Search from './HeaderSearchBar';
import { ThemeToggle } from '../theme-toggle';
import Brand from '@/app/_components/Brand';
// import { useScroll } from '@/hooks/useScroll';
// import { ThemeToggle } from '../theme-toggle';

const Header = () => {
    const [userData, setUserData] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasMounted = useHasMounted();
    const pathname = usePathname();
    const { isSidebarOpen, toggleSidebar } = useSidebar();

    // Pages where sidebar is hidden
    const isSidebarExcluded = pathname === "/" || 
                             pathname.startsWith("/docs") || 
                             pathname.startsWith("/posts") || 
                             pathname.startsWith("/edit");
    useEffect(() => {
        const fetchData = async () => {
            try {
                const uid = await getUid();
                if (uid) {
                    const data = await fetchUserData(uid);
                    setUserData(data.data);
                }
            }
            catch (error) {
                console.log("Error occured", error);
            }
            finally {
                setIsLoading(false)
            }
        };

        fetchData();
    }, []);
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black backdrop-blur-md border-slate-100 dark:border-slate-900">
            <div className="flex h-16 items-center flex-row justify-between px-4 md:px-8 gap-2">
                {/* Left Section */}
                <div className="flex items-center gap-1 md:gap-4 shrink-0">
                    {!isSidebarExcluded && (
                        <button
                            className="p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-all active:scale-90"
                            onClick={toggleSidebar}
                            aria-label="Toggle Sidebar"
                        >
                            {isSidebarOpen ? (
                                <>
                                <X size={20} className="text-slate-600 dark:text-slate-300 md:hidden" />
                                <TextAlignStart size={20} className="text-slate-600 dark:text-slate-300 hidden md:block" />
                                </>
                            ) : (
                                <TextAlignStart size={20} className="text-slate-600 dark:text-slate-300" />
                            )}
                        </button>
                    )}
                    <Brand href={userData ? "/feed" : "/"} />
                </div>

                {/* Middle Section - Search (Desktop) */}
                <div className="hidden md:flex flex-1 justify-center max-w-md">
                    <Search />
                </div>

                {/* Right Section */}
                <div className="flex items-center justify-end gap-1 md:gap-4 shrink-0">
                    <div className="md:hidden">
                        <Search />
                    </div>
                    
                    <Link href="/edit/new" className="hidden sm:flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white group transition-colors">
                        <SquarePen size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium hidden md:block">Write</span>
                    </Link>

                    <div className="hidden lg:block">
                        <ThemeToggle />
                    </div>
                    <button className="p-1.5 md:p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white relative transition-colors">
                        <Bell size={18} />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-600 rounded-full border border-white dark:border-black" />
                    </button>
                    <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-zinc-900 hidden lg:block" />

                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <div className={`h-8 w-8 bg-slate-100 dark:bg-zinc-900 rounded-full ${hasMounted ? 'animate-pulse' : ''}`} />
                        ) : (
                            <UserDropdown user={userData} />
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header