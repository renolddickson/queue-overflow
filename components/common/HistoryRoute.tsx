import { RouteConfig } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link';
import React from 'react'

const HistoryRoute = ({ routeConfig }: { routeConfig: RouteConfig}) => {

  return (
    <div className='flex justify-between mt-12'>
      <Link href={`${routeConfig?.prev?.id}`} className='flex gap-2 cursor-pointer text-gray-600 hover:text-blue-400 transition-colors items-center'>
        {routeConfig.prev &&
          <>
            <ChevronLeft />
            <h3 className='capitalize'>{routeConfig?.prev.title}</h3>
          </>
        }
      </Link>
      <Link href={`${routeConfig?.next?.id}`} className='flex gap-2 cursor-pointer text-gray-600 hover:text-blue-400 transition-colors items-center'>
        {routeConfig.next &&
          <>
            <h3 className='capitalize'>{routeConfig?.next?.title}</h3>
            <ChevronRight />
          </>}
      </Link>
    </div>
  )
}

export default HistoryRoute