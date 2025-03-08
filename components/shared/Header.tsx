"use client"
import { Menu } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { fetchUserData, getUid } from '@/actions/auth';
import UserDropdown from '../ui/UserDropDown';
import { User } from '@/types/api';
import Logo from '../common/Logo';
import { useHasMounted } from '@/hooks/useHasMounted'
import { useSidebar } from '@/context/SidebarContext';

const Header = () => {
    const [userData, setUserData] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasMounted = useHasMounted();
    const { toggleSidebar } = useSidebar();
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
        <header className="sticky top-0 z-50 border-b bg-white w-full">
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <button className='block md:hidden' onClick={toggleSidebar}>
                            <Menu />
                        </button>
                        {/* <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qKFoTPR0hM7zbjjY2Cbuu0NcORGjY7.png"
                            alt="Logo"
                            className="h-8 w-8"
                        /> */}
                        <Link href="/" className='flex gap-1'>
                            <Logo />
                        </Link>
                    </div>
                    <div className="relative flex-1 max-w-xl">
                        <input
                            type="search"
                            placeholder="What are you looking ?"
                            className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
                {isLoading ? (
                    <div className={`h-8 w-8 bg-gray-200 rounded-full ${hasMounted ? 'animate-pulse' : ''}`}></div>
                ) : (
                    <div className="flex flex-1 items-center justify-end gap-4">
                        <UserDropdown user={userData} />
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header