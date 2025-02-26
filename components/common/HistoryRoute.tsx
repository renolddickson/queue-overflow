import { RouteConfig } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

const HistoryRoute = ({routeConfig}:{routeConfig:RouteConfig}) => {
  return (
    <div className='flex justify-between mt-12'>
        <div className='flex gap-2 cursor-pointer text-gray-600 hover:text-blue-400 transition-colors items-center'>
        <ChevronLeft />
            <h3>{routeConfig.previous.title}</h3>
        </div>
        <div className='flex gap-2 cursor-pointer text-gray-600 hover:text-blue-400 transition-colors items-center'>
          <h3>{routeConfig.next.title}</h3>
        <ChevronRight />
        </div>
    </div>
  )
}

export default HistoryRoute