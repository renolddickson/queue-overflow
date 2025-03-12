import React from 'react'
import Image from 'next/image'
import { User } from '@/types/api'

export const Banner = ({userData}:{userData:User}) => {
    return (
        <>
            <div className='relative w-full h-52'>
                <Image src={userData.banner_image ?? '/assets/default-banner.jpg'} fill className='rounded-sm overflow-hidden'
                    style={{ objectFit: 'cover' }} alt="banner" />
                <div className='relative w-48 h-48 rounded-full overflow-hidden border-4 border-white md:left-5 left-[50%] -translate-x-[50%] md:translate-x-0 -bottom-[50%]'>
                    <Image src={userData.profile_image ?? "/assets/no-avatar.png"} fill
                    style={{ objectFit: 'cover' }} alt="banner" />
                </div>
            </div>
            <div className='w-full flex flex-col mt-24 mb-4'>
                {userData?.display_name && (
                    <span className='text-black font-bold text-2xl'>{userData?.display_name}</span>
                )}
                <span className='text-gray-400 ml-1'>@{userData?.user_name}</span>
            </div>
        </>
    )
}
