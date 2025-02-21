import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

const HistoryRoute = () => {
  return (
    <div className='flex justify-between mt-12'>
        <div className='flex gap-2 cursor-pointer hover:text-blue-400 transition-colors'>
        <ChevronLeft />
        <h3>Next topic</h3>
        </div>
        <div className='flex gap-2 cursor-pointer hover:text-blue-400 transition-colors'>
        <h3>Previous topic</h3>
        <ChevronRight />
        </div>
    </div>
  )
}

export default HistoryRoute