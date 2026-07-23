import { RouteConfig } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link';
import React from 'react'

const HistoryRoute = ({ routeConfig }: { routeConfig: RouteConfig}) => {

  return (
    <div className='flex items-stretch justify-between mt-12 gap-4'>
      {routeConfig.prev ? (
        <Link href={`${routeConfig?.prev?.id}`} className='flex-1 flex gap-2 cursor-pointer text-gray-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group min-w-0'>
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform shrink-0" size={18} />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Previous</span>
            <h3 className='font-bold text-slate-700 dark:text-slate-200 truncate'>{routeConfig?.prev.title}</h3>
          </div>
        </Link>
      ) : <div className="flex-1" />}

      {routeConfig.next ? (
        <Link href={`${routeConfig?.next?.id}`} className='flex-1 flex gap-2 cursor-pointer text-gray-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all items-center justify-end p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group text-right min-w-0'>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Next</span>
            <h3 className='font-bold text-slate-700 dark:text-slate-200 truncate'>{routeConfig?.next?.title}</h3>
          </div>
          <ChevronRight className="group-hover:translate-x-1 transition-transform shrink-0" size={18} />
        </Link>
      ) : <div className="flex-1" />}
    </div>
  )
}

export default HistoryRoute