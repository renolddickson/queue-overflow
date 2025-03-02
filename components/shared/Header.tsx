"use client"
import { AudioWaveform, Menu } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import MobileSidePanel from '../MobileSidePanel';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useUserStore } from '@/stores/store';
import { getUid } from '@/lib/api-handler';

const Header = () => {
    const { user, fetchUser } = useUserStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    useEffect(() => {
        const fetchUserByUid = async () => {
            try {
                const uid = await getUid();
                console.log(uid);
                
                if (uid) {
                    await fetchUser(uid);
                    console.log(user);
                }
            } catch (error) {
                console.error("Error fetching UID:", error);
            }
        };

        fetchUserByUid();
    }, [fetchUser]);
    return (
        <header className="sticky top-0 z-50 border-b bg-white w-full">
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <button className='block md:hidden' onClick={() => setIsSidebarOpen(true)}>
                            <Menu />
                        </button>
                        {/* <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qKFoTPR0hM7zbjjY2Cbuu0NcORGjY7.png"
                            alt="Logo"
                            className="h-8 w-8"
                        /> */}
                        <Link href="/q/1" className='flex gap-1'>
                            <AudioWaveform />
                            <span className="font-semibold">Q(ue)*2</span>
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
                <div className="flex flex-1 items-center justify-end gap-4">
                    {user ?
                        <div className='w-8 h-8 rounded-full border border-black'></div>
                        :
                        <Link href="/auth">
                            <Button variant={'ghost'}>Login</Button>
                        </Link>
                    }
                </div>
            </div>
            <MobileSidePanel isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </header>
    )
}

export default Header