import React from 'react'
import Image from "@/components/common/Image";
import { User } from '@/types/api'
import { BadgeCheck, Calendar, Link as LinkIcon, MapPin } from 'lucide-react';

export const Banner = ({userData}:{userData:User}) => {
    return (
        <div className="w-full mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Banner Image */}
            <div className='relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900'>
                <Image 
                    src={userData.banner_image ?? '/assets/default-banner.jpg'} 
                    fill 
                    className='object-cover opacity-90'
                    alt="banner" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
            </div>

            {/* Profile Info Overlay/Below Section */}
            <div className='px-4 md:px-10 -mt-16 md:-mt-20 relative z-10'>
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                    {/* Avatar */}
                    <div className='w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white dark:border-slate-950 shadow-2xl bg-white dark:bg-slate-800'>
                        <Image 
                            src={userData.profile_image ?? "/assets/no-avatar.png"} 
                            fill
                            className="object-cover"
                            alt="profile" 
                        />
                    </div>

                    {/* Meta Info */}
                    <div className='flex-1 pb-2'>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                            <h1 className='text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2'>
                                {userData?.display_name || userData?.user_name}
                                <BadgeCheck className="text-blue-500 w-6 h-6 md:w-8 md:h-8" fill="currentColor" fillOpacity={0.1} />
                            </h1>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
                            <span className="text-lg">@{userData?.user_name}</span>
                            <div className="hidden md:flex items-center gap-4 text-sm mt-1">
                                <span className="flex items-center gap-1.5">
                                    <MapPin size={14} />
                                    Global Citizen
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Joined recently
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons (Social/Follow) */}
                    <div className="flex items-center gap-3 pb-2">
                        <button className="px-6 py-2.5 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-full font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
                            Follow
                        </button>
                        <button className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <LinkIcon size={20} className="text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Simple Divider */}
            <div className="mt-10 h-px w-full bg-slate-100 dark:bg-slate-800" />
        </div>
    )
}
