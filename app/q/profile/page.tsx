import React from 'react'
import Image from 'next/image'
const page = () => {
  return (
    <div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex w-full flex-col p-4'>
        <div className='relative w-full h-52'>
        <Image src={'/assets/default-banner.jpg'} fill className='rounded-sm overflow-hidden'
            style={{ objectFit: 'cover' }} alt="banner" />
        <div className='relative w-48 h-48 rounded-full overflow-hidden border-4 border-white md:left-5 left-[50%] -translate-x-[50%] md:translate-x-0 -bottom-[50%]'>
        <Image src={'/assets/default-banner.jpg'} fill
            style={{ objectFit: 'cover' }} alt="banner" />
        </div>
        </div>
        <div className='w-full flex flex-col mt-24'>
            <span className='text-2xl font-bold'>Name here</span>
            <span className='text-gray-400 ml-1'>@author.id</span>
        </div>
    </div>
  )
}

export default page